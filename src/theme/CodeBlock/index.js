import React, {useState} from 'react';
import {Highlight, themes} from 'prism-react-renderer';

export default function CodeBlock({children, className: classNameProp, title}) {
  const [copied, setCopied] = useState(false);

  // Extract language from className (e.g. 'language-javascript')
  const language = classNameProp
    ? classNameProp.replace(/language-/, '')
    : 'text';

  const codeString = typeof children === 'string'
    ? children.replace(/\n$/, '')
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="app-code-block">
      {title && (
        <div className="app-code-block__title">
          {title}
        </div>
      )}
      <Highlight theme={themes.github} code={codeString} language={language}>
        {({style, tokens, getLineProps, getTokenProps}) => (
          <pre className="app-code-block__pre" style={style}>
            <button
              type="button"
              onClick={handleCopy}
              className="app-code-block__copy"
              aria-label="Copy code to clipboard"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
            <code>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({line})}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({token})} />
                  ))}
                </div>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
}
