import { useState } from 'react';
import axios from 'axios';
import 'codemirror/keymap/sublime';
import 'codemirror/theme/dracula.css';
import CodeMirror from '@uiw/react-codemirror';

function App() {
  const [code, setCode] = useState('');

  const checkCode = () => {
   console.log(code);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="absolute top-20 bottom-40 left-20 right-20 text-left">
          <div>Create a function to add two numbers.</div>
          <CodeMirror
            value={code}
            options={{
              theme: 'dracula',
              keyMap: 'sublime',
              mode: 'python',
            }}
            onChange={(editor, change) => {
              setCode(editor.getValue());
            }}
          />
          <div
            onClick={() => checkCode()}
            className="border-2 p-2 bg-green-600"
          >
            Submit Code
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;