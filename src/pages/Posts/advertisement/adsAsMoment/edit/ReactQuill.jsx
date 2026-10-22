import React, { useState } from 'react';
import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';
const App = ({ language, setDescriptionEn, setDescriptionKh, descriptionEn, descriptionKh }) => {

    const modules = {
        toolbar: [
            // { header: '1' }, { header: '2' }, { font: [] }
            [],
            // { size: [] }
            [],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image'
    ];

    const handleChange = (value) => {
        if (language === 'en') {
            setDescriptionEn(value)
        } else {
            setDescriptionKh(value)
        }
    }
    return (
        <>
            <ReactQuill
                theme="snow"
                value={language === 'en' ? descriptionEn : descriptionKh}
                onChange={handleChange}
                modules={modules}
                formats={formats}
                placeholder={language === 'en' ? 'Enter description in English...' : 'បញ្ចូលពិពណ៌នាភាសាខ្មែរ...'}
                className="bg-gray-50 "
            />

        </>




    );
};

export default App;
