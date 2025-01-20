const toggleLoader = (show, parentSelector='body') => {
    const style = document.createElement('style');
    style.innerHTML = `
        .loader-body {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            min-height:80vh;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            background:white; /* Optional: adds a background overlay */
            z-index: 9999;
        }

        .loader {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #811622;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    const parentElement = document.querySelector(`[data-fieldname="${parentSelector}"]`);
    if (!parentElement) {
        console.error("Parent element not found for selector:", parentSelector);
        return;
    }
    console.log(parentElement,show,parentSelector,'loader');
    if (show) {
            const loaderMarkup = `
                <div class="loader-body">
                    <div class="loader"></div>
                </div>`;
            parentElement.innerHTML = loaderMarkup; // Append loader to parent element
    }
    else {
        const loaderElement = parentElement.querySelector('.loader-body');
        if (loaderElement) {
            loaderElement.remove();
        }
    }
}
