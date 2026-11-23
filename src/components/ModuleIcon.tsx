import React from 'react';
import {
  TrendingDown, TrendingUp, Receipt, Landmark, Users, ArrowRightLeft, Target, CreditCard,
  FileText, Camera, PenTool, Printer, Table, Building2, Stethoscope, FileCheck,
  Calculator, Shuffle, QrCode, Barcode, Clock, KeyRound, Binary, Video,
  BookMarked, Timer, Calendar, Activity, GraduationCap, Droplet, Microscope, HeartPulse,
  Award, Compass, BookOpen, Pill, ScanLine, FileSpreadsheet, FileType2, Minimize2,
  Scan, Image as ImageIcon, Shield, ShieldAlert, Brush, Scissors, Lock, FolderLock,
  SearchCode, Sparkles, KeyRound as PinIcon, AppWindow, LockKeyhole, NotebookPen, Trash2,
  ShieldCheck, Wifi, PhoneForwarded, Fingerprint, UsersRound
} from 'lucide-react';

interface ModuleIconProps {
  id: string;
  className?: string;
}

export const ModuleIcon: React.FC<ModuleIconProps> = ({ id, className = 'w-5 h-5' }) => {
  switch (id) {
    case 'expense': return <TrendingDown className={className} />;
    case 'income': return <TrendingUp className={className} />;
    case 'bills': return <Receipt className={className} />;
    case 'zakat': return <Landmark className={className} />;
    case 'committee': return <Users className={className} />;
    case 'loans': return <ArrowRightLeft className={className} />;
    case 'savings': return <Target className={className} />;
    case 'fin_backup': return <CreditCard className={className} />;

    case 'pdftools': return <Minimize2 className={className} />;
    case 'pdf2word': return <FileType2 className={className} />;
    case 'pdf_sign_redact': return <PenTool className={className} />;
    case 'img2pdf': return <FileText className={className} />;
    case 'img2xls': return <FileSpreadsheet className={className} />;
    case 'img2word': return <FileType2 className={className} />;
    case 'cv': return <FileText className={className} />;
    case 'scanner': return <Scan className={className} />;
    case 'id_scanner': return <Camera className={className} />;
    case 'passport_scanner': return <ScanLine className={className} />;
    case 'passport_studio': return <ImageIcon className={className} />;
    case 'assignment_ocr': return <PenTool className={className} />;
    case 'invoice': return <Printer className={className} />;
    case 'hospital_clerk': return <Building2 className={className} />;
    case 'duty_rota': return <Table className={className} />;
    case 'stamp_sign': return <FileCheck className={className} />;

    case 'calc': return <Calculator className={className} />;
    case 'converter': return <Shuffle className={className} />;
    case 'qr_gen': return <QrCode className={className} />;
    case 'barcode_gen': return <Barcode className={className} />;
    case 'qr_scan': return <ScanLine className={className} />;
    case 'passwords': return <KeyRound className={className} />;
    case 'img_tools': return <ImageIcon className={className} />;
    case 'video_audio': return <Video className={className} />;
    case 'age': return <Clock className={className} />;
    case 'intruder_guard': return <ShieldAlert className={className} />;
    case 'watermark_studio': return <Brush className={className} />;
    case 'bg_eraser': return <Scissors className={className} />;
    case 'file_encryptor': return <Lock className={className} />;
    case 'hidden_locker': return <FolderLock className={className} />;
    case 'steganography': return <Binary className={className} />;
    case 'steganalysis': return <SearchCode className={className} />;
    case 'ai_enhancer': return <Sparkles className={className} />;
    case 'teleprompter': return <Video className={className} />;

    case 'notes': return <BookMarked className={className} />;
    case 'timer': return <Timer className={className} />;
    case 'timetable': return <Calendar className={className} />;
    case 'bmi': return <Activity className={className} />;
    case 'gpa': return <GraduationCap className={className} />;
    case 'islamic_daily': return <Compass className={className} />;
    case 'islamic': return <BookOpen className={className} />;

    case 'iv_calc': return <Droplet className={className} />;
    case 'dose_calc': return <Microscope className={className} />;
    case 'gfr_calc': return <Activity className={className} />;
    case 'clinical_scores': return <HeartPulse className={className} />;
    case 'anatomy': return <Stethoscope className={className} />;
    case 'pharmacy_exam': return <Pill className={className} />;
    case 'nursing_exam': return <HeartPulse className={className} />;
    case 'hajj_prep': return <Award className={className} />;
    case 'moavineen': return <UsersRound className={className} />;

    case 'security_hub': return <Shield className={className} />;
    case 'pin_vault': return <PinIcon className={className} />;
    case 'app_lock': return <AppWindow className={className} />;
    case 'calc_vault': return <Calculator className={className} />;
    case 'photo_vault': return <LockKeyhole className={className} />;
    case 'private_notes': return <NotebookPen className={className} />;
    case 'secure_delete': return <Trash2 className={className} />;
    case 'perm_auditor': return <ShieldCheck className={className} />;
    case 'wifi_scanner': return <Wifi className={className} />;
    case 'ussd_check': return <PhoneForwarded className={className} />;
    case 'thermal_printer': return <Printer className={className} />;
    case 'biometric_mgr': return <Fingerprint className={className} />;

    default: return <BookOpen className={className} />;
  }
};
