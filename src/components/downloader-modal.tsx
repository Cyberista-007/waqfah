'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Download, Video, AudioWaveform, Loader2, CheckCircle2 } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { Progress } from './ui/progress';


interface Format {
    itag: number;
    qualityLabel: string | null;
    container: string;
    contentLength?: number;
    type: 'video' | 'audio';
    hasAudio?: boolean;
}

interface CustomDownloaderModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    formats: Format[];
    title: string;
    videoId: string | null;
}

export function DownloaderModal({ isOpen, onOpenChange, formats, title, videoId }: CustomDownloaderModalProps) {
    const [downloadingItag, setDownloadingItag] = useState<number | null>(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'downloading' | 'completed' | 'error'>('idle');
    const [receivedBytes, setReceivedBytes] = useState(0);
    const [totalSizeBytes, setTotalSizeBytes] = useState(0);

    const handleDownload = async (format: Format) => {
        if (!videoId) return;

        setDownloadingItag(format.itag);
        setProgress(0);
        setReceivedBytes(0);
        setTotalSizeBytes(0);
        setStatus('downloading');

        const quality = format.qualityLabel || 'الصوت فقط';
        const suffix = format.hasAudio ? '' : ' (بدون صوت)';
        const fileName = `${title} - ${quality}${suffix}.${format.container}`;
        const downloadUrl = `/api/download?videoId=${videoId}&itag=${format.itag}&title=${encodeURIComponent(title)}&container=${format.container}`;

        try {
            const response = await fetch(downloadUrl);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const msg = errorData.message || 'فشل التنزيل من السيرفر';
                const detail = errorData.error ? ` (${errorData.error})` : '';
                throw new Error(`${msg}${detail}`);
            }

            const contentLengthStr = response.headers.get('Content-Length');
            const contentLength = contentLengthStr ? parseInt(contentLengthStr, 10) : 0;
            setTotalSizeBytes(contentLength);
            
            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader found');

            let currentReceived = 0;
            const chunks = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                chunks.push(value);
                currentReceived += value.length;
                setReceivedBytes(currentReceived);

                if (contentLength && contentLength > 0) {
                    setProgress((currentReceived / contentLength) * 100);
                } else {
                    // Fallback progress if content-length is missing
                    setProgress(prev => Math.min(prev + 0.1, 99));
                }
            }

            const blob = new Blob(chunks);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            
            setStatus('completed');
            setTimeout(() => {
                setStatus('idle');
                setDownloadingItag(null);
            }, 3000);

        } catch (error) {
            console.error('Download error:', error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    const videoFormats = formats.filter(f => f.type === 'video');
    const audioFormats = formats.filter(f => f.type === 'audio');

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-zinc-950 border-white/10 text-white" dir="rtl">
                <DialogHeader className="text-right">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Download className="text-primary" /> {title}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        لضمان أعلى سرعة، يفضل اختيار الصيغ التي تحتوي على (صوت + فيديو) مباشرة.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar px-1">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent text-right">
                                <TableHead className="text-right text-zinc-500 uppercase text-[10px] font-black tracking-widest w-[160px]">الدقة</TableHead>
                                <TableHead className="text-right text-zinc-500 uppercase text-[10px] font-black tracking-widest">نوع الملف</TableHead>
                                <TableHead className="text-right text-zinc-500 uppercase text-[10px] font-black tracking-widest">الحجم</TableHead>
                                <TableHead className="text-left text-zinc-500 uppercase text-[10px] font-black tracking-widest">الإجراء</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {videoFormats.map((format, index) => (
                                <TableRow key={`video-${format.itag}-${index}`} className="border-white/5 group hover:bg-white/5 transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-white text-lg">{format.qualityLabel}</span>
                                            {format.hasAudio ? (
                                                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full w-fit font-bold border border-emerald-500/20">صوت + فيديو</span>
                                            ) : (
                                                <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full w-fit font-bold border border-amber-500/20">فيديو فقط</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Video className="h-4 w-4" /> {format.container}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-400">{format.contentLength ? formatBytes(format.contentLength) : 'غير متوفر'}</TableCell>
                                    <TableCell className="text-left">
                                        <Button 
                                            size="sm" 
                                            variant={downloadingItag === format.itag ? "outline" : (format.hasAudio ? "default" : "secondary")}
                                            onClick={() => handleDownload(format)}
                                            disabled={status === 'downloading'}
                                            className="rounded-xl min-w-[100px]"
                                        >
                                            {downloadingItag === format.itag ? (
                                                status === 'completed' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Download className="me-2 h-4 w-4"/>
                                                    <span>تنزيل</span>
                                                </>
                                            )}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                             {audioFormats.map((format, index) => (
                                <TableRow key={`audio-${format.itag}-${index}`} className="border-white/5 group hover:bg-white/5 transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-right">
                                            <span className="font-bold text-emerald-500 text-lg">تحميل صوتي</span>
                                            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full w-fit font-bold border border-emerald-500/20">MP3 / Audio</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <AudioWaveform className="h-4 w-4" /> {format.container}
                                        </div>
                                    </TableCell>
                                     <TableCell className="text-zinc-400">{format.contentLength ? formatBytes(format.contentLength) : 'غير متوفر'}</TableCell>
                                    <TableCell className="text-left">
                                         <Button 
                                            size="sm" 
                                            variant={downloadingItag === format.itag ? "outline" : "default"}
                                            onClick={() => handleDownload(format)}
                                            disabled={status === 'downloading'}
                                            className="rounded-xl min-w-[100px]"
                                        >
                                             {downloadingItag === format.itag ? (
                                                status === 'completed' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Download className="me-2 h-4 w-4"/>
                                                    <span>تنزيل</span>
                                                </>
                                            )}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {status === 'downloading' && (
                    <div className="mt-6 space-y-3 bg-white/5 p-4 rounded-3xl border border-white/5">
                        <div className="flex justify-between items-center text-xs font-bold">
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-400">جاري التحميل...</span>
                                <span className="text-primary">{formatBytes(receivedBytes)} {totalSizeBytes > 0 && `/ ${formatBytes(totalSizeBytes)}`}</span>
                            </div>
                            <span className="text-primary text-sm">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-white/10" />
                        <p className="text-[10px] text-zinc-500 text-center italic">
                            يرجى عدم إغلاق هذه النافذة للحفاظ على تقدم التحميل.
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
