import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Form, Button } from 'antd';

const BoldIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>);
const ItalicIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>);
const UnderlineIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>);

const UnorderedListIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>);
const OrderedListIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <path d="M3 6.5L5 4V8" />
    <path d="M3 12.5H5.5C6 12.5 6 13 6 13.5V14.5C6 15 5.5 15.5 5 15.5H3" />
    <path d="M3 18.5H6M3 20.5H6M4.5 18.5V20.5" />
</svg>);

const CodeIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>);

const LinkIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>);
const UnlinkIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 12.5l-2-2"></path><path d="M12.5 14.5l-2-2"></path><path d="M9.9 14.9C6.8 17.1 5.8 20.2 7 21l3.5-3.5"></path><path d="M14.9 9.9C17.1 6.8 20.2 5.8 21 7l-3.5 3.5"></path><path d="M6.5 18.5l2 2"></path><path d="M16.5 4.5l2 2"></path></svg>);

const useTextEditor = (props) => {
    const { initialHtml = '', setDescription } = props
    const editorRef = useRef(null);
    const [htmlContent, setHtmlContent] = useState(initialHtml);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [currentSelection, setCurrentSelection] = useState(null);
    const [linkUrl, setLinkUrl] = useState('');

    const captureSelection = useCallback(() => {
        if (window.getSelection().rangeCount > 0) {
            setCurrentSelection(window.getSelection().getRangeAt(0));
        }
    }, []);

    const formatText = useCallback((command, value = null) => {
        if (editorRef.current) {
            try {
                editorRef.current.focus();
                if (command === "createLink") {
                    captureSelection();
                    setShowLinkModal(true);
                    return;
                }
                document.execCommand(command, false, value);
                if (command === "insertOrderedList" || command === "insertUnorderedList") {
                    document.execCommand("insertLineBreak");
                }
                handleInput();
            } catch (error) {
                console.error("Failed to execute command:", command, error);
            }
        }
    }, [captureSelection]);

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            setHtmlContent(html);
            if (setDescription) setDescription(html); // sync with parent state
        }
    }, [setDescription]);

    useEffect(() => {
        if (editorRef.current) {
            // -   editorRef.current.innerHTML = initialHtml;
            if (initialHtml && editorRef.current.innerHTML !== initialHtml) {
                editorRef.current.innerHTML = initialHtml;
            }
        }
    }, [initialHtml]);

    const executeLinkCommand = useCallback(() => {
        if (linkUrl && currentSelection) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(currentSelection);
            document.execCommand('createLink', false, linkUrl);
            setShowLinkModal(false);
            setLinkUrl('');
            setCurrentSelection(null);
            handleInput();
        }
    }, [linkUrl, currentSelection, handleInput]);

    return { editorRef, htmlContent, handleInput, formatText, showLinkModal, setShowLinkModal, linkUrl, setLinkUrl, executeLinkCommand };
};



const App = (props) => {
    const { setDescription, initialContent, language, initialHtml } = props
    const { form } = props
    const { editorRef, htmlContent, handleInput, formatText, showLinkModal, setShowLinkModal, linkUrl, setLinkUrl, executeLinkCommand } = useTextEditor({ initialHtml: initialContent || '', setDescription });


    const ToolbarButton = ({ command, icon: Icon, title, value = null }) => (
        <button onClick={() => formatText(command, value)} title={title} className="p-2 transition-all duration-200 rounded-md hover:bg-gray-200 active:scale-95 disabled:opacity-50" aria-label={title}>
            <Icon className="w-5 h-5 text-gray-700" />
        </button>
    );
    const LinkModal = () => {
        if (!showLinkModal) return null;
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Insert Hyperlink</h3>
                    <input type="url" placeholder="e.g., https://www.google.com" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4" onKeyDown={(e) => { if (e.key === 'Enter') { executeLinkCommand() } }} />
                    <div className="flex justify-end space-x-3">
                        <button onClick={() => setShowLinkModal(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                        <button onClick={executeLinkCommand} disabled={!linkUrl.trim()} className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors">Insert Link</button>
                    </div>
                </div>
            </div>
        );
    };
    return (
        <Form component="div" form={form} layout="vertical">
            <style>{`
                .editor-content-area:focus { outline: none; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5); }
                .editor-content-area strong { font-weight: 700; }
                .editor-content-area em { font-style: italic; }
                .editor-content-area u { text-decoration: underline; }
                .editor-content-area p { margin-bottom: 0.5rem; }
                .editor-content-area h1 { font-size: 1.875rem; font-weight: 700; margin-top: 1rem; margin-bottom: 0.5rem; }
                .editor-content-area ul, .editor-content-area ol { margin-left: 1.5rem; margin-bottom: 0.5rem; list-style-position: outside; padding-left: 0; }
                .editor-content-area ul { list-style-type: disc; }
                .editor-content-area ol { list-style-type: decimal; }
                .editor-content-area a { color: #2563EB; text-decoration: underline; cursor: pointer; }
                .editor-content-area pre { background-color: #f3f4f6; padding: 0.5rem; border-radius: 0.375rem; font-family: monospace; overflow-x: auto; margin-bottom: 0.5rem; }
            `}</style>

            <LinkModal />

            <Form.Item required>
                <div className="bg-white  border">
                    <div className="flex flex-wrap gap-1 p-3 border-b bg-gray-100 sticky top-0 z-10">
                        <ToolbarButton command="bold" icon={BoldIcon} title="Bold (Ctrl+B)" />
                        {/* <ToolbarButton command="italic" icon={ItalicIcon} title="Italic (Ctrl+I)" /> */}
                        <ToolbarButton command="underline" icon={UnderlineIcon} title="Underline (Ctrl+U)" />
                        <div className="w-px h-6 bg-gray-300 mx-2"></div>
                        <ToolbarButton command="createLink" icon={LinkIcon} title="Insert Link" />
                        <ToolbarButton command="unlink" icon={UnlinkIcon} title="Remove Link" />
                        <div className="w-px h-6 bg-gray-300 mx-2"></div>
                        <ToolbarButton command="insertUnorderedList" icon={UnorderedListIcon} title="Bulleted List (Dots)" />
                        <ToolbarButton command="insertOrderedList" icon={OrderedListIcon} title="Numbered List (1, 2, 3...)" value="true" />
                        <div className="w-px h-6 bg-gray-300 mx-2"></div>
                        <ToolbarButton command="formatBlock" icon={() => <span className="font-bold text-sm">H1</span>} title="Heading 1" value="H1" />
                        <ToolbarButton command="formatBlock" icon={() => <span className="font-bold text-sm">P</span>} title="Paragraph" value="P" />
                        <ToolbarButton command="formatBlock" icon={CodeIcon} title="Code Block" value="PRE" />
                    </div>

                    <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleInput}
                        spellCheck="true"
                        className="editor-content-area p-5 sm:p-8 text-gray-900 leading-relaxed transition-shadow duration-300 focus:ring-4 focus:ring-blue-500/50 bg-white"
                        data-placeholder={htmlContent ? '' : 'Start typing your content...'}
                    />

                    {/* <div ref={editorRef} contentEditable onInput={handleInput} spellCheck="true" className="editor-content-area p-5 sm:p-8 text-gray-900 leading-relaxed transition-shadow duration-300 focus:ring-4 focus:ring-blue-500/50 bg-white" data-placeholder="Start typing your content..."></div> */}
                </div>
            </Form.Item>
        </Form>
    );
};

export default App;
