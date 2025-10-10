"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

type MarkdownRendererProps = {
  content: string;
};

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-lg max-w-none mx-auto px-4 sm:px-6 lg:px-8">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-4xl font-bold mt-8 mb-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-3xl font-semibold mt-7 mb-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-2xl font-semibold mt-6 mb-2" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-xl font-semibold mt-5 mb-2" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p
              className="mb-4 leading-relaxed text-gray-800 dark:text-gray-200"
              {...props}
            />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-blue-600 dark:text-blue-400 underline hover:opacity-80 break-words"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-gray-400 dark:border-gray-600 pl-5 italic text-gray-600 dark:text-gray-300 my-4"
              {...props}
            />
          ),
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline ? (
              <SyntaxHighlighter
                style={oneDark}
                language={match ? match[1] : "text"}
                PreTag="div"
                className="rounded-md my-4 p-4 overflow-x-auto"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code
                className="bg-gray-200 dark:bg-gray-800 text-red-600 dark:text-red-400 rounded px-1 py-[2px] font-mono text-sm"
                {...props}
              >
                {children}
              </code>
            );
          },
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-8 space-y-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-8 space-y-2" {...props} />
          ),
          li: ({ node, checked, ...props }) => {
            if (checked !== undefined) {
              return (
                <li className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    readOnly
                    className="w-4 h-4"
                  />
                  <span {...props} />
                </li>
              );
            }
            return <li className="mb-2" {...props} />;
          },
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table
                className="table-auto border-collapse border border-gray-400 dark:border-gray-700 w-full"
                {...props}
              />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              className="border border-gray-400 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-left"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="border border-gray-300 dark:border-gray-700 px-4 py-2"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr
              className="border-gray-300 dark:border-gray-700 my-6"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
