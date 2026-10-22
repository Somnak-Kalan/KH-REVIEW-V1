# Big-System

## Start this project

### Clone (ssh)

```
git clone git@gitlab.com:git-system-code/big-system.git
```

### Go to the project

```
cd big-system
```

### Installation

```
npm install --save
```

### Running

```
npm start
```

# Directory and file structure.

```
├── public
└── src
    ├── App.jsx // for config routes
    ├── assets  // for fonts and images
    ├── layouts // for layouts
    ├── pages   // for pages that use route in App.jsx
    |   ├── Sample
    |   |   └── Sample.jsx  // sample for use in others page
    |   └── mainFolderName
    |       └── pageName.jsx // can copy from sample above for use in other page
    ├── components
    |   ├── componentName.jsx
    |   └── folderName
    |       └── componentName.jsx
    ├── services
    |   └── fileName.service.js // file for rest api and call for use in ui
    └── utils
        └── http-common.js // connection file (axios)

```

```-------------color----------``
```background``
#0f172a   /* slate-900 */
```text color ```
Primary #e2e8f0 → text-slate-200
Secondary #94a3b8 → text-slate-400
Muted #64748b → text-slate-500
```-----------------```


//sweetAlert2
await Swal.fire({
    icon: 'success',
    title: 'Hide Creator Post Successfully',
    text: 'The creator post has been hidden successfully.',
    timer: 1500, // auto close after 1.5s
    showConfirmButton: false
})

If you want it a bit smoother (most apps use this):

await Swal.fire({
    icon: 'success',
    title: 'Hide Creator Post Successfully',
    text: 'The creator post has been hidden successfully.',
    timer: 1800,
    timerProgressBar: true,
    showConfirmButton: false
})