import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker via Vite-resolved module URL
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export type WebPdfToWordMode = 'SMART_HYBRID' | 'PRESERVE_LAYOUT' | 'FAST_TEXT';

export type DocElement =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; text: string; numbered: boolean }
  | { type: 'table'; rows: string[][] }
  | { type: 'image'; pngBytes: Uint8Array; widthPx: number; heightPx: number; caption: string };

export interface PageConversionSummary {
  pageNumber: number;
  elements: DocElement[];
  plainText: string;
  usedVisualFallback: boolean;
}

export interface WebPdfToWordResult {
  blob: Blob;
  fileName: string;
  pagesConverted: number;
  totalWords: number;
  headingsCount: number;
  tablesCount: number;
  visualPagesCount: number;
  extractedText: string;
}

interface RawToken {
  str: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontName: string;
}

interface SpatialRow {
  y: number;
  avgH: number;
  tokens: RawToken[];
  text: string;
}

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function sanitizeXmlText(input: string): string {
  // Strip invalid XML 1.0 control characters and escape XML entities
  let cleaned = '';
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    const valid =
      code === 0x09 ||
      code === 0x0a ||
      code === 0x0d ||
      (code >= 0x20 && code <= 0xd7ff) ||
      (code >= 0xe000 && code <= 0xfffd);
    if (valid) cleaned += input[i];
  }
  return cleaned
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function groupTokensIntoRows(tokens: RawToken[]): SpatialRow[] {
  const nonEmpty = tokens.filter((t) => t.str.trim().length > 0);
  if (nonEmpty.length === 0) return [];

  // PDF y-axis increases bottom-to-top; sort descending so top-most lines come first
  const sorted = [...nonEmpty].sort((a, b) => {
    if (Math.abs(a.y - b.y) > Math.max(4, Math.min(a.h, b.h) * 0.45)) {
      return b.y - a.y;
    }
    return a.x - b.x;
  });

  const rows: SpatialRow[] = [];
  for (const tok of sorted) {
    const last = rows[rows.length - 1];
    const tol = Math.max(4, (last?.avgH || tok.h || 10) * 0.45);
    if (last && Math.abs(last.y - tok.y) <= tol) {
      last.tokens.push(tok);
      last.avgH = (last.avgH * (last.tokens.length - 1) + tok.h) / last.tokens.length;
    } else {
      rows.push({
        y: tok.y,
        avgH: tok.h || 11,
        tokens: [tok],
        text: '',
      });
    }
  }

  for (const row of rows) {
    row.tokens.sort((a, b) => a.x - b.x);
    let lineText = '';
    let prevRight = -Infinity;
    for (const tok of row.tokens) {
      if (lineText.length > 0) {
        const gap = tok.x - prevRight;
        if (gap > Math.max(2, tok.h * 0.18)) {
          lineText += ' ';
        }
      }
      lineText += tok.str;
      prevRight = tok.x + Math.max(tok.w, tok.str.length * tok.h * 0.45);
    }
    row.text = lineText.replace(/\s+/g, ' ').trim();
  }

  return rows.filter((r) => r.text.length > 0);
}

function splitRowIntoColumns(row: SpatialRow): string[] {
  if (row.tokens.length < 2) return [row.text];
  const cells: string[] = [];
  let currentCell = row.tokens[0].str;
  let prevRight = row.tokens[0].x + Math.max(row.tokens[0].w, row.tokens[0].str.length * 5);

  const colGapThreshold = Math.max(18, row.avgH * 1.45);
  for (let i = 1; i < row.tokens.length; i++) {
    const tok = row.tokens[i];
    const gap = tok.x - prevRight;
    if (gap >= colGapThreshold) {
      cells.push(currentCell.replace(/\s+/g, ' ').trim());
      currentCell = tok.str;
    } else {
      currentCell += (gap > 2 ? ' ' : '') + tok.str;
    }
    prevRight = tok.x + Math.max(tok.w, tok.str.length * Math.max(4, tok.h * 0.45));
  }
  cells.push(currentCell.replace(/\s+/g, ' ').trim());
  return cells.filter((c) => c.length > 0);
}

function classifyElementsFromRows(rows: SpatialRow[], detectTables: boolean): DocElement[] {
  if (rows.length === 0) return [];

  const heights = rows.map((r) => r.avgH).filter((h) => h > 0).sort((a, b) => a - b);
  const medianH = heights.length > 0 ? heights[Math.floor(heights.length / 2)] : 11;

  const elements: DocElement[] = [];
  let i = 0;

  while (i < rows.length) {
    // Attempt multi-column table block detection (>= 2 consecutive rows with >= 2 separated columns)
    if (detectTables) {
      const tableRows: string[][] = [];
      let j = i;
      while (j < rows.length) {
        const cols = splitRowIntoColumns(rows[j]);
        if (cols.length >= 2) {
          tableRows.push(cols);
          j++;
        } else {
          break;
        }
      }
      if (tableRows.length >= 2) {
        const maxCols = Math.max(...tableRows.map((r) => r.length));
        const normalized = tableRows.map((r) => {
          const copy = [...r];
          while (copy.length < maxCols) copy.push('');
          return copy;
        });
        elements.push({ type: 'table', rows: normalized });
        i = j;
        continue;
      }
    }

    const row = rows[i];
    const txt = row.text;
    const isBullet = /^[•\-*▪‣◦]\s+/.test(txt);
    const isNumbered = /^\d{1,3}[.)]\s+/.test(txt);

    if (isBullet || isNumbered) {
      elements.push({
        type: 'list',
        text: txt.replace(/^([•\-*▪‣◦]|\d{1,3}[.)])\s+/, '').trim(),
        numbered: isNumbered,
      });
      i++;
      continue;
    }

    const isUpperShort =
      txt.length <= 70 &&
      txt === txt.toUpperCase() &&
      /[A-Z]{3,}/.test(txt);

    if (row.avgH >= medianH * 1.38) {
      elements.push({ type: 'heading', level: 1, text: txt });
      i++;
      continue;
    }
    if (row.avgH >= medianH * 1.15 || isUpperShort) {
      elements.push({ type: 'heading', level: 2, text: txt });
      i++;
      continue;
    }

    // Merge consecutive body lines belonging to the same paragraph
    let para = txt;
    let k = i + 1;
    while (k < rows.length) {
      const prevRow = rows[k - 1];
      const nextRow = rows[k];
      const nextCols = detectTables ? splitRowIntoColumns(nextRow) : [nextRow.text];
      if (nextCols.length >= 2) break;
      const nextTxt = nextRow.text;
      if (
        /^[•\-*▪‣◦]\s+/.test(nextTxt) ||
        /^\d{1,3}[.)]\s+/.test(nextTxt) ||
        nextRow.avgH >= medianH * 1.15
      ) {
        break;
      }
      const verticalGap = prevRow.y - nextRow.y;
      const lineStep = Math.max(10, medianH * 1.65);
      const endsSentence = /[.!?:]$/.test(prevRow.text);
      if (verticalGap > lineStep || (endsSentence && verticalGap > medianH * 1.25)) {
        break;
      }
      if (para.endsWith('-')) {
        para = para.slice(0, -1) + nextTxt;
      } else {
        para += ' ' + nextTxt;
      }
      k++;
    }

    elements.push({ type: 'paragraph', text: para });
    i = k;
  }

  return elements;
}

async function renderPageToPngBytes(
  page: pdfjsLib.PDFPageProxy,
  scale = 1.75
): Promise<{ pngBytes: Uint8Array; widthPx: number; heightPx: number }> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable for PDF page rendering');
  }
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: ctx, viewport, canvas }).promise;

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG export failed'))), 'image/png');
  });
  const ab = await blob.arrayBuffer();
  return {
    pngBytes: new Uint8Array(ab),
    widthPx: canvas.width,
    heightPx: canvas.height,
  };
}

// ---------- Minimal Standards-Compliant ZIP Builder (STORED, UTF-8) ----------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

interface ZipInputEntry {
  path: string;
  data: Uint8Array;
}

function createZipBlob(entries: ZipInputEntry[], mimeType: string): Blob {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.path);
    const data = entry.data;
    const crc = crc32(data);

    // Local File Header (30 bytes + filename)
    const lfh = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(lfh.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true); // version needed
    lv.setUint16(6, 0x0800, true); // UTF-8 filename flag
    lv.setUint16(8, 0, true); // compression method: 0 = STORED
    lv.setUint16(10, 0, true);
    lv.setUint16(12, 0x5421, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    lfh.set(nameBytes, 30);

    localParts.push(lfh, data);

    // Central Directory Header (46 bytes + filename)
    const cdh = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(cdh.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0x5421, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    cdh.set(nameBytes, 46);

    centralParts.push(cdh);
    offset += lfh.length + data.length;
  }

  let cdSize = 0;
  for (const c of centralParts) cdSize += c.length;

  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  const blobParts: BlobPart[] = [...localParts, ...centralParts, eocd].map(
    (u8) => u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer
  );
  return new Blob(blobParts, { type: mimeType });
}

// ---------- OOXML (.docx) Assembly ----------

function buildStylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
        <w:color w:val="1E293B"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="120" w:line="276" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:keepNext/><w:spacing w:before="240" w:after="100"/></w:pPr>
    <w:rPr><w:b/><w:color w:val="0F5132"/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:keepNext/><w:spacing w:before="180" w:after="80"/></w:pPr>
    <w:rPr><w:b/><w:color w:val="1E3A8A"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:keepNext/><w:spacing w:before="140" w:after="60"/></w:pPr>
    <w:rPr><w:b/><w:color w:val="334155"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr>
  </w:style>
  <w:style w:type="table" w:styleId="TableGrid">
    <w:name w:val="Table Grid"/>
    <w:tblPr>
      <w:tblBorders>
        <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
        <w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
      </w:tblBorders>
    </w:tblPr>
  </w:style>
</w:styles>`;
}

export function buildDocxFromPages(
  pages: PageConversionSummary[],
  documentTitle: string,
  preservePageBreaks: boolean,
  includeHeaderBanner: boolean
): Blob {
  const encoder = new TextEncoder();
  const mediaEntries: { relId: string; fileName: string; bytes: Uint8Array }[] = [];
  let nextRelIdx = 2; // rId1 reserved for styles.xml

  const bodyChunks: string[] = [];

  if (includeHeaderBanner) {
    bodyChunks.push(
      `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>${sanitizeXmlText(documentTitle)}</w:t></w:r></w:p>`
    );
  }

  let listCounter = 0;

  pages.forEach((page, pageIdx) => {
    if (pageIdx > 0 && preservePageBreaks) {
      bodyChunks.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
      listCounter = 0;
    }

    for (const el of page.elements) {
      if (el.type === 'heading') {
        listCounter = 0;
        const styleId = el.level === 1 ? 'Heading1' : el.level === 2 ? 'Heading2' : 'Heading3';
        bodyChunks.push(
          `<w:p><w:pPr><w:pStyle w:val="${styleId}"/></w:pPr><w:r><w:t xml:space="preserve">${sanitizeXmlText(el.text)}</w:t></w:r></w:p>`
        );
      } else if (el.type === 'paragraph') {
        listCounter = 0;
        bodyChunks.push(
          `<w:p><w:r><w:t xml:space="preserve">${sanitizeXmlText(el.text)}</w:t></w:r></w:p>`
        );
      } else if (el.type === 'list') {
        const prefix = el.numbered ? `${++listCounter}. ` : '• ';
        bodyChunks.push(
          `<w:p><w:pPr><w:ind w:left="420" w:hanging="240"/></w:pPr><w:r><w:t xml:space="preserve">${sanitizeXmlText(prefix + el.text)}</w:t></w:r></w:p>`
        );
      } else if (el.type === 'table') {
        listCounter = 0;
        const rowsXml = el.rows
          .map((row, rowIdx) => {
            const cellsXml = row
              .map((cell) => {
                const shading = rowIdx === 0 ? '<w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>' : '';
                const boldTag = rowIdx === 0 ? '<w:rPr><w:b/></w:rPr>' : '';
                return `<w:tc><w:tcPr>${shading}<w:tcMar><w:top w:w="80" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:spacing w:after="40"/></w:pPr><w:r>${boldTag}<w:t xml:space="preserve">${sanitizeXmlText(cell)}</w:t></w:r></w:p></w:tc>`;
              })
              .join('');
            return `<w:tr>${cellsXml}</w:tr>`;
          })
          .join('');

        bodyChunks.push(
          `<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="9360" w:type="dxa"/></w:tblPr>${rowsXml}</w:tbl><w:p/>`
        );
      } else if (el.type === 'image') {
        listCounter = 0;
        const relId = `rId${nextRelIdx++}`;
        const mediaName = `page_${page.pageNumber}_${nextRelIdx}.png`;
        mediaEntries.push({ relId, fileName: mediaName, bytes: el.pngBytes });

        // Fit inside A4 printable width (~6.4 inches = 5852160 EMUs)
        const maxWidthEmu = 5852160;
        const aspect = el.heightPx / Math.max(1, el.widthPx);
        const cx = maxWidthEmu;
        const cy = Math.round(maxWidthEmu * aspect);
        const docPrId = nextRelIdx;

        bodyChunks.push(
          `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${docPrId}" name="${sanitizeXmlText(el.caption)}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${docPrId}" name="${sanitizeXmlText(mediaName)}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${relId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`
        );
      }
    }
  });

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
  <w:body>
    ${bodyChunks.join('\n    ')}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const relsEntriesXml = [
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>',
    ...mediaEntries.map(
      (m) =>
        `<Relationship Id="${m.relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${m.fileName}"/>`
    ),
  ].join('\n  ');

  const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${relsEntriesXml}
</Relationships>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const pngExtensionDefault =
    mediaEntries.length > 0 ? '<Default Extension="png" ContentType="image/png"/>' : '';

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  ${pngExtensionDefault}
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

  const zipEntries: ZipInputEntry[] = [
    { path: '[Content_Types].xml', data: encoder.encode(contentTypesXml) },
    { path: '_rels/.rels', data: encoder.encode(rootRelsXml) },
    { path: 'word/_rels/document.xml.rels', data: encoder.encode(docRelsXml) },
    { path: 'word/styles.xml', data: encoder.encode(buildStylesXml()) },
    { path: 'word/document.xml', data: encoder.encode(documentXml) },
    ...mediaEntries.map((m) => ({
      path: `word/media/${m.fileName}`,
      data: m.bytes,
    })),
  ];

  return createZipBlob(zipEntries, DOCX_MIME);
}

export function buildDocxFromEditedText(
  editedText: string,
  documentTitle: string,
  preservePageBreaks = true
): Blob {
  const pageChunks = editedText.split(/\n*---\s*Page Break\s*---\n*/i);
  const pages: PageConversionSummary[] = pageChunks.map((chunk, idx) => {
    const lines = chunk.split(/\r?\n/).filter((l, lineIdx) => {
      if (lineIdx === 0 && /^Page \d+$/i.test(l.trim())) return false;
      return true;
    });

    const elements: DocElement[] = [];
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;
      if (line.includes(' | ') && line.split(' | ').length >= 2) {
        elements.push({ type: 'table', rows: [line.split(' | ').map((c) => c.trim())] });
      } else if (/^[•\-*]\s+/.test(line)) {
        elements.push({ type: 'list', text: line.replace(/^[•\-*]\s+/, ''), numbered: false });
      } else if (/^\d{1,3}[.)]\s+/.test(line)) {
        elements.push({ type: 'list', text: line.replace(/^\d{1,3}[.)]\s+/, ''), numbered: true });
      } else if (line.length <= 65 && line === line.toUpperCase() && /[A-Z]{3,}/.test(line)) {
        elements.push({ type: 'heading', level: 2, text: line });
      } else {
        elements.push({ type: 'paragraph', text: line });
      }
    }
    return {
      pageNumber: idx + 1,
      elements: elements.length > 0 ? elements : [{ type: 'paragraph', text: '' }],
      plainText: lines.join('\n'),
      usedVisualFallback: false,
    };
  });

  return buildDocxFromPages(pages, documentTitle, preservePageBreaks, false);
}

function elementsToEditableText(elements: DocElement[]): string {
  return elements
    .map((el) => {
      switch (el.type) {
        case 'heading':
          return el.text;
        case 'paragraph':
          return el.text;
        case 'list':
          return `${el.numbered ? '1.' : '•'} ${el.text}`;
        case 'table':
          return el.rows.map((r) => r.join(' | ')).join('\n');
        case 'image':
          return `[${el.caption} — Embedded as editable page image in Word]`;
      }
    })
    .join('\n\n');
}

export async function convertPdfFileToWordDocx(
  file: File,
  options: {
    mode?: WebPdfToWordMode;
    detectTables?: boolean;
    preservePageBreaks?: boolean;
    includeHeaderBanner?: boolean;
    onProgress?: (percent: number, status: string) => void;
  } = {}
): Promise<WebPdfToWordResult> {
  const {
    mode = 'SMART_HYBRID',
    detectTables = true,
    preservePageBreaks = true,
    includeHeaderBanner = false,
    onProgress,
  } = options;

  onProgress?.(5, 'Reading PDF binary structure...');
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  const pageSummaries: PageConversionSummary[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const pct = 10 + Math.round((pageNum / Math.max(1, totalPages)) * 75);
    onProgress?.(pct, `Extracting layout & typography (Page ${pageNum} of ${totalPages})...`);

    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();

    const tokens: RawToken[] = [];
    for (const item of textContent.items) {
      if ('str' in item && item.str.trim().length > 0) {
        const tx = item.transform;
        const fontHeight = Math.hypot(tx[2], tx[3]) || Math.abs(item.height) || 11;
        tokens.push({
          str: item.str,
          x: tx[4],
          y: tx[5],
          w: item.width || 0,
          h: fontHeight,
          fontName: item.fontName || '',
        });
      }
    }

    const totalChars = tokens.reduce((acc, t) => acc + t.str.trim().length, 0);
    let elements: DocElement[] = [];
    let usedVisual = false;

    if (mode === 'PRESERVE_LAYOUT') {
      const rendered = await renderPageToPngBytes(page, 1.85);
      elements.push({
        type: 'image',
        pngBytes: rendered.pngBytes,
        widthPx: rendered.widthPx,
        heightPx: rendered.heightPx,
        caption: `Page ${pageNum} Exact Layout`,
      });
      usedVisual = true;
      if (totalChars > 0) {
        const rows = groupTokensIntoRows(tokens);
        elements = [...elements, ...classifyElementsFromRows(rows, detectTables)];
      }
    } else if (totalChars >= 12) {
      const rows = groupTokensIntoRows(tokens);
      elements = classifyElementsFromRows(rows, detectTables);
    } else {
      // Scanned or image-only PDF page: embed high-res page image so Word doc preserves content cleanly
      const rendered = await renderPageToPngBytes(page, 1.85);
      elements = [
        {
          type: 'image',
          pngBytes: rendered.pngBytes,
          widthPx: rendered.widthPx,
          heightPx: rendered.heightPx,
          caption: `Scanned Page ${pageNum}`,
        },
      ];
      usedVisual = true;
    }

    const plainText = elementsToEditableText(elements);
    pageSummaries.push({
      pageNumber: pageNum,
      elements,
      plainText,
      usedVisualFallback: usedVisual,
    });
  }

  onProgress?.(92, 'Packaging OOXML Microsoft Word (.docx) container...');
  const cleanTitle = file.name.replace(/\.pdf$/i, '') || 'Converted_Document';
  const safeBase = cleanTitle.replace(/[^a-zA-Z0-9._-]/g, '_');
  const outName = `${safeBase}.docx`;

  const blob = buildDocxFromPages(pageSummaries, cleanTitle, preservePageBreaks, includeHeaderBanner);

  const headingsCount = pageSummaries.reduce(
    (sum, p) => sum + p.elements.filter((e) => e.type === 'heading').length,
    0
  );
  const tablesCount = pageSummaries.reduce(
    (sum, p) => sum + p.elements.filter((e) => e.type === 'table').length,
    0
  );
  const visualPagesCount = pageSummaries.filter((p) => p.usedVisualFallback).length;
  const extractedText = pageSummaries
    .map((p) => `Page ${p.pageNumber}\n${p.plainText}`)
    .join('\n\n--- Page Break ---\n\n');
  const totalWords = extractedText.split(/\s+/).filter((w) => w.length > 0 && w !== '---').length;

  onProgress?.(100, 'Editable Word (.docx) document ready!');

  return {
    blob,
    fileName: outName,
    pagesConverted: pageSummaries.length,
    totalWords,
    headingsCount,
    tablesCount,
    visualPagesCount,
    extractedText,
  };
}
