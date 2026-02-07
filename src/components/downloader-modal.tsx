

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Download, Video, AudioWaveform } from 'lucide-react';
import { formatBytes } from '@/lib/utils';


interface Format {
    itag: number;
    qualityLabel: string | null;
    container: string;
    hasAudio: boolean;
    url: string;
    contentLength?: number;
}

interface CustomDownloaderModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    formats: Format[];
    title: string;
}

export function DownloaderModal({ isOpen, onOpenChange, formats, title }: CustomDownloaderModalProps) {
    
    const handleDownload = (format: Format) => {
        if (!format.url) {
            console.error("Download URL is missing for this format.");
            return;
        }

        const quality = format.qualityLabel || 'الصوت فقط';
        const fileName = `${title} - ${quality}.${format.container}`;

        // Create a temporary anchor element and trigger download
        // This is more robust than window.location.href for downloads
        const anchor = document.createElement('a');
        anchor.href = format.url;
        anchor.download = fileName;
        anchor.target = "_blank"; // Good practice for external links
        anchor.rel = "noopener noreferrer";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    };

    const videoFormats = formats.filter(f => f.qualityLabel);
    const audioFormats = formats.filter(f => !f.qualityLabel && f.hasAudio);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>تحميل: {title}</DialogTitle>
                    <DialogDescription>
                        اختر الصيغة المناسبة لك. قد يكون التنزيل بطيئًا للملفات الكبيرة.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>الجودة</TableHead>
                                <TableHead>النوع</TableHead>
                                <TableHead>الحجم</TableHead>
                                <TableHead className="text-left">تنزيل</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {videoFormats.map(format => (
                                <TableRow key={`video-${format.itag}`}>
                                    <TableCell>{format.qualityLabel}</TableCell>
                                    <TableCell className="flex items-center gap-2">
                                        <Video className="h-4 w-4" /> {format.container}
                                    </TableCell>
                                    <TableCell>{format.contentLength ? formatBytes(format.contentLength) : 'N/A'}</TableCell>
                                    <TableCell className="text-left">
                                        <Button size="sm" onClick={() => handleDownload(format)}>
                                            <Download className="me-2 h-4 w-4"/>
                                            <span>تنزيل</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                             {audioFormats.map(format => (
                                <TableRow key={`audio-${format.itag}`}>
                                    <TableCell>صوت فقط</TableCell>
                                    <TableCell className="flex items-center gap-2">
                                        <AudioWaveform className="h-4 w-4" /> {format.container}
                                    </TableCell>
                                     <TableCell>{format.contentLength ? formatBytes(format.contentLength) : 'N/A'}</TableCell>
                                    <TableCell className="text-left">
                                         <Button size="sm" onClick={() => handleDownload(format)}>
                                            <Download className="me-2 h-4 w-4"/>
                                            <span>تنزيل</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    )
}
