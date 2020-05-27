// Quill.js Plugin - Markdown Shortcuts
// This is a module for the Quill.js WYSIWYG editor (https://quilljs.com/)
// which converts text entered as markdown to rich text.
//
// v0.0.5
//
// Author: Patrick Lee (me@patricklee.nyc)
//
// (c) Copyright 2017 Patrick Lee (me@patricklee.nyc).
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
import Quill from "quill";

import HorizontalRule from "./formats/hr";
import formats from "./formats";

Quill.register("formats/horizontal", HorizontalRule);

const allRules = [
  "header",
  "blockquote",
  "code-block",
  "bolditalic",
  "bold",
  "italic",
  "strikethrough",
  "code",
  "hr",
  "plus-ul",
  "image",
  "link",
];
class MarkdownShortcuts {
  constructor(quill, options) {
    this.quill = quill;
    this.options = options;

    this.ignoreTags = ["PRE"];
    this.matches = [];

    const includeRules = this.options.includeFormats || allRules;

    includeRules.forEach((format) => {
      const formatDefinition = formats[format];
      if (format === "header" && this.options.headerPattern) {
        formatDefinition.pattern = this.options.headerPattern;
      }

      this.matches.push(formatDefinition);
    });

    // Handler that looks for insert deltas that match specific characters
    this.quill.on("text-change", (delta, oldContents, source) => {
      for (let i = 0; i < delta.ops.length; i++) {
        if (delta.ops[i].hasOwnProperty("insert")) {
          if (delta.ops[i].insert === " ") {
            this.onSpace();
          } else if (delta.ops[i].insert === "\n") {
            this.onEnter();
          }
        }
      }
    });
  }

  isValid(text, tagName) {
    return (
      typeof text !== "undefined" &&
      text &&
      this.ignoreTags.indexOf(tagName) === -1
    );
  }

  onSpace() {
    const selection = this.quill.getSelection();
    if (!selection) return;
    const [line, offset] = this.quill.getLine(selection.index);
    const text = line.domNode.textContent;
    const lineStart = selection.index - offset;
    if (this.isValid(text, line.domNode.tagName)) {
      for (let match of this.matches) {
        const matchedText = text.match(match.pattern);
        if (matchedText) {
          // Check if the match is allowed
          if (!this.options.shouldFormat(match)) return;

          // We need to replace only matched text not the whole line
          match.action(this.quill, text, selection, match.pattern, lineStart);
          return;
        }
      }
    }
  }

  onEnter() {
    let selection = this.quill.getSelection();
    if (!selection) return;
    const [line, offset] = this.quill.getLine(selection.index);
    const text = line.domNode.textContent + " ";
    const lineStart = selection.index - offset;
    selection.length = selection.index++;
    if (this.isValid(text, line.domNode.tagName)) {
      for (let match of this.matches) {
        const matchedText = text.match(match.pattern);
        if (matchedText) {
          // Check if the match is allowed
          if (!this.options.shouldFormat(match)) return;

          match.action(this.quill, text, selection, match.pattern, lineStart);
          return;
        }
      }
    }
  }
}

if (window.Quill) {
  window.Quill.register("modules/markdownShortcuts", MarkdownShortcuts);
}

module.exports = MarkdownShortcuts;
