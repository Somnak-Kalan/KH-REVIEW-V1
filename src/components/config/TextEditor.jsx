import React, { useState, useRef, useEffect } from 'react'
import ReactQuill from 'react-quill'
// import 'react-quill/dist/quill.snow.css'

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['clean'],
  ],
}

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'link',
  'image',
]

const MyEditor = () => {
  const [content, setContent] = useState('')
  const quillRef = useRef(null)

  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor() // Get Quill instance properly
    }
  }, [])

  const handleChange = (value) => {
    setContent(value)
  }

  return (
    <div>
      <ReactQuill
        ref={quillRef} // Correct way to use ref
        value={content}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        theme='snow'
        placeholder='Enter description...'
      />
    </div>
  )
}

export default MyEditor
