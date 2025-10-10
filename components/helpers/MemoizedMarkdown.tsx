"use client";

import React, { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

type MarkdownRendererProps = {
  content: string;
};

// Memoized component definitions with proper typing
const H1 = memo(
  (props: React.HTMLAttributes<HTMLHeadingElement> & { level?: number }) => (
    <h1 className="text-4xl font-bold mt-8 mb-4" {...props} />
  )
);
H1.displayName = "H1";

const H2 = memo(
  (props: React.HTMLAttributes<HTMLHeadingElement> & { level?: number }) => (
    <h2 className="text-3xl font-semibold mt-7 mb-3" {...props} />
  )
);
H2.displayName = "H2";

const H3 = memo(
  (props: React.HTMLAttributes<HTMLHeadingElement> & { level?: number }) => (
    <h3 className="text-2xl font-semibold mt-6 mb-2" {...props} />
  )
);
H3.displayName = "H3";

const H4 = memo(
  (props: React.HTMLAttributes<HTMLHeadingElement> & { level?: number }) => (
    <h4 className="text-xl font-semibold mt-5 mb-2" {...props} />
  )
);
H4.displayName = "H4";

const Paragraph = memo((props: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className="mb-4 leading-relaxed text-gray-800 dark:text-gray-200"
    {...props}
  />
));
Paragraph.displayName = "Paragraph";

const Link = memo((props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a
    className="text-blue-600 dark:text-blue-400 underline hover:opacity-80 break-words"
    target="_blank"
    rel="noopener noreferrer"
    {...props}
  />
));
Link.displayName = "Link";

const Blockquote = memo(
  (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-gray-400 dark:border-gray-600 pl-5 italic text-gray-600 dark:text-gray-300 my-4"
      {...props}
    />
  )
);
Blockquote.displayName = "Blockquote";

const Code = memo(
  (props: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) => {
    const { inline, className, children } = props;
    const match = /language-(\w+)/.exec(className || "");
    return !inline ? (
      <SyntaxHighlighter
        style={oneDark}
        language={match ? match[1] : "text"}
        PreTag="div"
        className="rounded-md my-4 p-4 overflow-x-auto"
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
  }
);
Code.displayName = "Code";

const UnorderedList = memo((props: React.HTMLAttributes<HTMLUListElement>) => (
  <ul className="list-disc pl-8 space-y-2" {...props} />
));
UnorderedList.displayName = "UnorderedList";

const OrderedList = memo((props: React.OlHTMLAttributes<HTMLOListElement>) => (
  <ol className="list-decimal pl-8 space-y-2" {...props} />
));
OrderedList.displayName = "OrderedList";

const ListItem = memo((props: React.LiHTMLAttributes<HTMLLIElement>) => {
  const { children } = props;
  return (
    <li className="mb-2" {...props}>
      {children}
    </li>
  );
});
ListItem.displayName = "ListItem";

const Table = memo((props: React.TableHTMLAttributes<HTMLTableElement>) => (
  <div className="overflow-x-auto my-4">
    <table
      className="table-auto border-collapse border border-gray-400 dark:border-gray-700 w-full"
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = memo(
  (props: React.ThHTMLAttributes<HTMLTableHeaderCellElement>) => (
    <th
      className="border border-gray-400 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-left"
      {...props}
    />
  )
);
TableHeader.displayName = "TableHeader";

const TableData = memo(
  (props: React.TdHTMLAttributes<HTMLTableDataCellElement>) => (
    <td
      className="border border-gray-300 dark:border-gray-700 px-4 py-2"
      {...props}
    />
  )
);
TableData.displayName = "TableData";

const HorizontalRule = memo((props: React.HTMLAttributes<HTMLHRElement>) => (
  <hr className="border-gray-300 dark:border-gray-700 my-6" {...props} />
));
HorizontalRule.displayName = "HorizontalRule";

// Memoized components object
const components = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  p: Paragraph,
  a: Link,
  blockquote: Blockquote,
  code: Code,
  ul: UnorderedList,
  ol: OrderedList,
  li: ListItem,
  table: Table,
  th: TableHeader,
  td: TableData,
  hr: HorizontalRule,
} as const;

// Memoized plugins arrays
const remarkPlugins = [remarkGfm];
const rehypePlugins = [rehypeRaw];

function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Memoize the entire markdown rendering
  const renderedContent = useMemo(
    () => (
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {content}
      </ReactMarkdown>
    ),
    [content]
  );

  return (
    <div className="prose prose-lg max-w-none mx-auto px-4 sm:px-6 lg:px-8">
      {renderedContent}
    </div>
  );
}

// Export memoized component with custom comparison
export default memo(MarkdownRenderer, (prevProps, nextProps) => {
  return prevProps.content === nextProps.content;
});
