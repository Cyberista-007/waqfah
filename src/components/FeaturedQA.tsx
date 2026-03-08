'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { QAPair } from "@/lib/types";
import { HelpCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import Link from "next/link";

export function FeaturedQA({ qa }: { qa: QAPair | null }) {
    if (!qa) {
        return null;
    }

    return (
        <section>
            <h2 className="text-3xl font-bold font-headline mb-6 flex items-center gap-2">
                <HelpCircle />
                من كنوز الأسئلة
            </h2>
            <Card className="bg-muted/30">
                <CardContent className="p-6">
                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1" className="border-b-0">
                            <AccordionTrigger className="text-xl text-right font-semibold hover:no-underline">
                                {qa.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-lg text-muted-foreground leading-relaxed pt-4">
                                <p>{qa.answer}</p>
                                <Link href="/qa" className="text-primary hover:underline mt-4 block">اقرأ المزيد من الأسئلة...</Link>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </section>
    );
}
