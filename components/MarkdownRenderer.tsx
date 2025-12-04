import React from 'react';

interface Props {
  content: string;
}

const MarkdownRenderer: React.FC<Props> = ({ content }) => {
  // Simple parser for basic markdown features to avoid heavy libraries
  // Handles headers, bold, bullet points
  
  const lines = content.split('\n');

  return (
    <div className="space-y-3 text-slate-700 leading-relaxed break-words overflow-wrap-anywhere">
      {lines.map((line, idx) => {
        // Headers
        if (line.startsWith('### ')) {
          return <h3 key={idx} className="text-lg font-bold text-primary mt-4 mb-2 break-words">{line.replace('### ', '')}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={idx} className="text-xl font-bold text-slate-800 mt-6 mb-3 border-b pb-1 break-words">{line.replace('## ', '')}</h2>;
        }
        
        // Lists
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
             const text = line.replace(/^(\s*)[-*]\s+/, '');
             const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-slate-900">$1</span>');
             return (
                 <div key={idx} className="flex items-start gap-2 ml-2 min-w-0">
                     <span className="text-primary mt-1.5 flex-shrink-0">•</span>
                     <span className="break-words overflow-wrap-anywhere" dangerouslySetInnerHTML={{ __html: formattedText }} />
                 </div>
             )
        }

        // Empty lines
        if (line.trim() === '') return <div key={idx} className="h-2"></div>;

        // Paragraphs with bold parsing
        const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-slate-900">$1</span>');
        return <p key={idx} className="break-words overflow-wrap-anywhere" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
      })}
    </div>
  );
};

export default MarkdownRenderer;