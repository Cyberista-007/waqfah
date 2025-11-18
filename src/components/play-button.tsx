"use client"

import { Play } from "lucide-react"
import { useAudioPlayer, type Track } from "./audio-player-provider"
import { Button } from "./ui/button"
import { useFirestore, useUser } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface PlayButtonProps {
    track: Track;
}

export function PlayButton({ track }: PlayButtonProps) {
    const { playTrack } = useAudioPlayer();
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const handlePlay = async () => {
        let startTime = 0;
        if (user && firestore) {
            const historyRef = doc(firestore, 'users', user.uid, 'listenHistory', track.id);
            const historySnap = await getDoc(historyRef);
            if (historySnap.exists()) {
                const data = historySnap.data();
                // Start from beginning if less than 10s left or very close to start
                if (data.position && data.duration && (data.duration - data.position) > 10 && data.position > 5) {
                    startTime = data.position;
                    toast({
                        title: "تكملة الاستماع",
                        description: `تم استئناف المحاضرة من حيث توقفت.`,
                    });
                }
            }
        }
        playTrack(track, startTime);
    };

    return (
        <Button 
            onClick={handlePlay}
            className="w-full bg-primary/80 text-primary-foreground hover:bg-primary/90 transition-colors"
            size="lg"
        >
            <Play className="w-6 h-6 me-2" />
            <span>استماع</span>
        </Button>
    )
}
