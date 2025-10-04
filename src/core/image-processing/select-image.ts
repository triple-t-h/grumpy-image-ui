const selectImage = async () => {
    return new Promise<File | null | Error>(
        (resolve, reject) => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            input.onchange = (event: Event) => {
                const target = event.target as HTMLInputElement;
                if (target.files && target.files.length > 0) {
                    const file = target.files.item(0)
                    resolve(file)
                } else {
                    reject(new Error('No file selected.'));
                }
            };
            input.click();
        })
}

export { selectImage };

