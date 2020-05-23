export default {
  header: {
    name: "header",
    pattern: /^(#){1,6}\s/g,
    action: (quill, text, selection, pattern) => {
      var match = pattern.exec(text);
      if (!match) return;
      const size = match[0].length;
      // Need to defer this action https://github.com/quilljs/quill/issues/1134
      setTimeout(() => {
        quill.formatLine(selection.index, 0, "header", size);
        quill.deleteText(selection.index - size, size);
      }, 0);
    },
  },
  blockquote: {
    name: "blockquote",
    pattern: /^(>)\s/g,
    action: (quill, text, selection) => {
      // Need to defer this action https://github.com/quilljs/quill/issues/1134
      setTimeout(() => {
        quill.formatLine(selection.index, 1, "blockquote", true);
        quill.deleteText(selection.index - 2, 2);
      }, 0);
    },
  },
  "code-block": {
    name: "code-block",
    pattern: /^`{3}(?:\s|\n)/g,
    action: (quill, text, selection) => {
      // Need to defer this action https://github.com/quilljs/quill/issues/1134
      setTimeout(() => {
        quill.formatLine(selection.index, 1, "code-block", true);
        quill.deleteText(selection.index - 4, 4);
      }, 0);
    },
  },
  bolditalic: {
    name: "bolditalic",
    pattern: /(?:\*|_){3}(.+?)(?:\*|_){3}/g,
    action: (quill, text, selection, pattern, lineStart) => {
      let match = pattern.exec(text);

      const annotatedText = match[0];
      const matchedText = match[1];
      const startIndex = lineStart + match.index;

      if (text.match(/^([*_ \n]+)$/g)) return;

      setTimeout(() => {
        quill.deleteText(startIndex, annotatedText.length);
        quill.insertText(startIndex, matchedText, {
          bold: true,
          italic: true,
        });
        quill.format("bold", false);
      }, 0);
    },
  },
  bold: {
    name: "bold",
    pattern: /(?:\*|_){2}(.+?)(?:\*|_){2}/g,
    action: (quill, text, selection, pattern, lineStart) => {
      let match = pattern.exec(text);

      const annotatedText = match[0];
      const matchedText = match[1];
      const startIndex = lineStart + match.index;

      if (text.match(/^([*_ \n]+)$/g)) return;

      setTimeout(() => {
        quill.deleteText(startIndex, annotatedText.length);
        quill.insertText(startIndex, matchedText, { bold: true });
        quill.format("bold", false);
      }, 0);
    },
  },
  italic: {
    name: "italic",
    pattern: /(?:\*|_){1}(.+?)(?:\*|_){1}/g,
    action: (quill, text, selection, pattern, lineStart) => {
      let match = pattern.exec(text);

      const annotatedText = match[0];
      const matchedText = match[1];
      const startIndex = lineStart + match.index;

      if (text.match(/^([*_ \n]+)$/g)) return;

      setTimeout(() => {
        quill.deleteText(startIndex, annotatedText.length);
        quill.insertText(startIndex, matchedText, { italic: true });
        quill.format("italic", false);
      }, 0);
    },
  },
  strikethrough: {
    name: "strikethrough",
    pattern: /(?:~~)(.+?)(?:~~)/g,
    action: (quill, text, selection, pattern, lineStart) => {
      let match = pattern.exec(text);

      const annotatedText = match[0];
      const matchedText = match[1];
      const startIndex = lineStart + match.index;

      if (text.match(/^([*_ \n]+)$/g)) return;

      setTimeout(() => {
        quill.deleteText(startIndex, annotatedText.length);
        quill.insertText(startIndex, matchedText, { strike: true });
        quill.format("strike", false);
      }, 0);
    },
  },
  code: {
    name: "code",
    pattern: /(?:`)(.+?)(?:`)/g,
    action: (quill, text, selection, pattern, lineStart) => {
      let match = pattern.exec(text);

      const annotatedText = match[0];
      const matchedText = match[1];
      const startIndex = lineStart + match.index;

      if (text.match(/^([*_ \n]+)$/g)) return;

      setTimeout(() => {
        quill.deleteText(startIndex, annotatedText.length);
        quill.insertText(startIndex, matchedText, { code: true });
        quill.format("code", false);
        quill.insertText(quill.getSelection(), " ");
      }, 0);
    },
  },
  hr: {
    name: "hr",
    pattern: /^([-*]\s?){3}/g,
    action: (quill, text, selection) => {
      const startIndex = selection.index - text.length;
      setTimeout(() => {
        quill.deleteText(startIndex, text.length);

        quill.insertEmbed(startIndex + 1, "divider", true, Quill.sources.USER);
        quill.insertText(startIndex + 2, "\n", Quill.sources.SILENT);
        quill.setSelection(startIndex + 2, Quill.sources.SILENT);
      }, 0);
    },
  },
  "plus-ul": {
    name: "plus-ul",
    // Quill 1.3.5 already treat * as another trigger for bullet lists
    pattern: /^\+\s$/g,
    action: (quill, text, selection, pattern) => {
      setTimeout(() => {
        quill.formatLine(selection.index, 1, "list", "unordered");
        quill.deleteText(selection.index - 2, 2);
      }, 0);
    },
  },
  image: {
    name: "image",
    pattern: /(?:!\[(.+?)\])(?:\((.+?)\))/g,
    action: (quill, text, selection, pattern) => {
      const startIndex = text.search(pattern);
      const matchedText = text.match(pattern)[0];
      // const hrefText = text.match(/(?:!\[(.*?)\])/g)[0]
      const hrefLink = text.match(/(?:\((.*?)\))/g)[0];
      const start = selection.index - matchedText.length - 1;
      if (startIndex !== -1) {
        setTimeout(() => {
          quill.deleteText(start, matchedText.length);
          quill.insertEmbed(
            start,
            "image",
            hrefLink.slice(1, hrefLink.length - 1)
          );
        }, 0);
      }
    },
  },
  link: {
    name: "link",
    pattern: /(?:\[(.+?)\])(?:\((.+?)\))/g,
    action: (quill, text, selection, pattern) => {
      const startIndex = text.search(pattern);
      const matchedText = text.match(pattern)[0];
      const hrefText = text.match(/(?:\[(.*?)\])/g)[0];
      const hrefLink = text.match(/(?:\((.*?)\))/g)[0];
      const start = selection.index - matchedText.length - 1;
      if (startIndex !== -1) {
        setTimeout(() => {
          quill.deleteText(start, matchedText.length);
          quill.insertText(
            start,
            hrefText.slice(1, hrefText.length - 1),
            "link",
            hrefLink.slice(1, hrefLink.length - 1)
          );
        }, 0);
      }
    },
  },
};
