import React from 'react';
import { StreamLanguage } from '@codemirror/language';
import { lua } from '@codemirror/legacy-modes/mode/lua';
import CodeMirror from '@uiw/react-codemirror';

/**
 * LuaEditor component for editing Lua code
 * Encapsulates the CodeMirror editor with Lua syntax highlighting
 */
const LuaEditor = ({ value, onChange }) => {
  return (
    <div className="lua-editor-container">
      <CodeMirror
        value={value}
        height="200px"
        extensions={[StreamLanguage.define(lua)]}
        onChange={onChange}
      />
    </div>
  );
};

export default LuaEditor;
