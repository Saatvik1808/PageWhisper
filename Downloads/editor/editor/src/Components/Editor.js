import React, { useEffect, useRef, useState } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/theme/dracula.css';

import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike'; // This includes modes for C, C++, and related languages
import 'codemirror/theme/vibrant-ink.css';

import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/theme/solarized.css';
import 'codemirror/theme/ambiance.css';
import 'codemirror/theme/material.css';


import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
    const editorRef = useRef(null);
    const [currentLanguageMode, setCurrentLanguageMode] = useState('clike'); // Default to C++ mode

    useEffect(() => {
        async function init() {
            editorRef.current = Codemirror.fromTextArea(
                document.getElementById('realtimeEditor'),
                {
                    mode: 'text/x-c++src', // Set the mode based on the state
                    theme: 'material',
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                }
            );

            editorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);
                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code,
                    });
                }
            });
        }
        init();
    }, [currentLanguageMode]); // Use currentLanguageMode here, not selectedLanguageMode

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code !== null) {
                    editorRef.current.setValue(code);
                }
            });
        }

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        };
    }, [socketRef.current]);

    // Function to change the language mode
    const changeLanguageMode = (mode) => {
        setCurrentLanguageMode(mode);
    };

    return (
        <div>
            
            <textarea id="realtimeEditor"></textarea>
        </div>
    );
};

export default Editor;
