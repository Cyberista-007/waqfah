'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SECTIONS } from './constants';

/**
 * Section Grid: The main pillars of the page.
 */
export function SectionGrid() {
  return (
    <section className="py-24">
      <div className="container px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SECTIONS.map((section, i) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="p-12 rounded-[3.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all text-right group"
            >
              <div className={cn("w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform", section.color)}>
                <section.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">{section.title}</h3>
              <p className="text-lg text-white/40 leading-relaxed">{section.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
