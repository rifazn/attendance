const fileInput = document.querySelector('[name=file-upload]')
const fileUploadForm = document.querySelector('[name=file-upload-form]')
console.log(fileUploadForm)

fileUploadForm.addEventListener('submit', (ev) => {
    ev.preventDefault();

    const file = fileInput.files[0];

    if (file) {
        const formData = new FormData();
        formData.append('file-upload', file);

        fetch('upload-attendance', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            const sumry = document.querySelector('#summaryReport')
            sumry.style = 'display: block;'
            sumry.innerText = data.message
            console.log('Success:', data);

        })
        .catch(error => {
            console.error('Error:', error); // Handle error
        });
    } else {
        console.error('No file selected.');
    }
})
