const {loadTip, alertMessage, loadIcon, fullScreen, loadModal} = (() => {

    const loadModalStyle = () => {
        const styleDom = document.createElement('style');
        styleDom.innerHTML = `.mask {background-color: rgba(0, 0, 0, .5);position: fixed;left: 0;right: 0;top: 0;bottom: 0;display: flex;justify-content: center;align-items: center;z-index: 1999;backdrop-filter: blur(4px);}`
            + `.panel {width: 85%;text-align: center;background: linear-gradient(135deg, #2396ef 0%, #1e88e5 100%);padding: 1.2em;border-radius: 16px;box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);}`
            + `.panel .title {font-size: 1.6em;font-weight: 700;color: #fff;margin-bottom: 1em;text-shadow: 0 2px 4px rgba(0,0,0,0.1);}`
            + `.panel .content {margin: 1em 0;padding: 1.2em;background-color: #fff;border-radius: 12px;color: #333;line-height: 1.6;font-size: 1.1em;}`
            + `.panel .content-item {margin: 0.5em 0;padding: 0.4em 0;border-bottom: 1px solid #eee;}`
            + `.close-btn {border: none;background: #4caf50;color: #fff;padding: 0.8em 2em;margin-top: 1em;border-radius: 8px;font-size: 1.1em;font-weight: 600;cursor: pointer;transition: all 0.3s ease;box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);}`
            + `.close-btn:hover {background: #388e3c;transform: translateY(-2px);}`
            + `.close-btn:active {transform: translateY(0);}`
            + `.block-input {border: 0;display: inline-block;padding: .4em;margin: .4em;background: #ffd7bd;}`;
        document.head.appendChild(styleDom);
    }

    const loadModalComponent = (className, text) => {
        const component = document.createElement('div');
        component.className = className;
        component.addEventListener('touchend', (e) => {e.stopPropagation();e.preventDefault()});
        component.addEventListener('click', (e) => {e.stopPropagation();e.preventDefault()});
        if (text)
            component.textContent = text;
        return component;
    }

    const loadModalBtn = (className, text, onClick) => {
        const component = document.createElement('button')
        component.className = className;
        component.addEventListener('touchend', (e) => {onClick && onClick(e);e.stopPropagation();e.preventDefault()});
        component.addEventListener('click', (e) => {e.stopPropagation();e.preventDefault()});
        if (text)
            component.textContent = text
        return component;
    }

    const loadModal = (title, content, onClose) => {
        const modalModal = loadModalComponent('mask');
        const modalPanel = loadModalComponent('panel');
        const modalTitle = loadModalComponent('title', title);
        const modalContent = loadModalComponent('content');
        if ('[object String]' === Object.prototype.toString.apply(content)) {
            modalContent.textContent = content;
        } else if ('[object Array]' === Object.prototype.toString.apply(content)) {
            content.map(item=>modalContent.appendChild(item))
        } else {
            modalContent.appendChild(content);
        }
        const btn = loadModalBtn('close-btn', 'I Know', ()=>[document.body.removeChild(modalModal), onClose && onClose()]);

        document.body.appendChild(modalModal);
        modalModal.appendChild(modalPanel);
        modalPanel.appendChild(modalTitle);
        modalPanel.appendChild(modalContent);
        modalPanel.appendChild(btn);
    }
    
    const loadTip = async () => {
        const modalData = await fetch('/___modal.json').then(res=>res.json())
        const contentsList = []
        let contents = modalData.content.split("\n")
        for (let i = 0; i < contents.length; i++) {
            contentsList.push(loadModalComponent('content-item', contents[i]));
        }
        loadModal(modalData.title, contentsList)
    }

    const alertMessage = async (message, onclose) => {
        loadModal('Message', message, onclose)
    }

    const loadIcon = () => {
        const logoDiv = document.createElement('div');
        logoDiv.style.backgroundImage = 'url(___logo.png)';
        logoDiv.style.width = 'min(10vw, 10vh)';
        logoDiv.style.height = 'min(10vw, 10vh)';
        logoDiv.style.position = 'fixed';
        logoDiv.style.top = 'min(2vw, 2vh)';
        logoDiv.style.right = 'min(2vw, 2vh)';
        logoDiv.style.zIndex = '1998';
        logoDiv.style.borderRadius = 'min(1vw, 1vh)';
        logoDiv.style.backgroundSize = '100% 100%';
        document.body.appendChild(logoDiv);
    }

    const fullScreen = () => {
        if (window.needFull && window.Android && window.Android.fullScreen) {
            window.Android.fullScreen()
        }
    }

    loadModalStyle();
    // 加载健康提示
    window.addEventListener('load', loadTip);

    return {loadTip, alertMessage, loadModal, loadIcon, fullScreen};

})()