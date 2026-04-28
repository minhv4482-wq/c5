(function (d) {

    const createComponent = (content, className) => {
        const component = d.createElement('div');
        if (className)
            component.className = className;
        if (content === undefined || content === null)
            return component
        const typeStr = Object.prototype.toString.apply(content)
        if (typeStr === '[object String]')
            component.textContent = content
        else if (typeStr === '[object Array]')
            content.map(item=>component.appendChild(item))
        else
            component.appendChild(content)
        return component;
    }

    let lastScene = null;

    // 加载拼图素材列表
    const loadImgList = (number = 1, list = []) => {
        return new Promise((s, f) => {
            const img = document.createElement('img');
            img.onload = () => loadImgList(number + 1, [...list, number]).then(s).catch(f)
            img.onerror = () => s(list)
            img.src = 'target/' + number + '.jpg';
        })
    }

    // 加载场景
    const showLoading = (ele) => {
        const scene = createComponent(null, 'scene loading-scene')
        const loaded = createComponent('0%', 'pro')
        const barLoaded = createComponent(null, 'bar box loaded')
        const barAll = createComponent(barLoaded, 'bar box all')
        scene.appendChild(loaded);
        scene.appendChild(barAll);

        lastScene && ele.removeChild(lastScene)
        ele.appendChild(scene);
        lastScene = scene;

        let p = 0;
        let list = null;
        barLoaded.style.width = p + '%';

        let timer = setInterval(() => {
            p += parseInt(Math.random() * 15) // 降低加载进度跳动幅度，更自然
            p = Math.min(p, 99);
            loaded.textContent = p + '%';
            barLoaded.style.width = loaded.textContent;
            if (list && p >= 99) {
                clearInterval(timer)
                barLoaded.style.width = '100%';
                loaded.textContent = '100%';
                setTimeout(() => {
                    showLevelScene(ele, list, 0)
                }, 500);
            }
        }, 200);

        loadImgList().then(pics=>list=pics);
    }

    // 难度选择场景
    const showLevelScene = (ele, list, picIndex = 0) => {
        const scene = createComponent(null, 'scene level-scene')
        const title = createComponent('PUZZLE LEVEL', 'title')

        const pic = document.createElement('img')
        pic.src = "target/" + list[picIndex] + '.jpg';
        pic.alt = `Puzzle Image ${picIndex + 1}`;
        pic.style.borderRadius = '12px';
        pic.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';

        // 上一张/下一张按钮
        const prevBtn = createComponent(null, 'prev-btn');
        const nextBtn = createComponent(null, 'next-btn');

        prevBtn.addEventListener('touchend', () => {
            picIndex = (picIndex + list.length - 1) % list.length;
            pic.src = "target/" + list[picIndex] + '.jpg';
        });

        nextBtn.addEventListener('touchend', () => {
            picIndex = (picIndex + 1) % list.length;
            pic.src = "target/" + list[picIndex] + '.jpg';
        });

        const maps = createComponent([prevBtn, pic, nextBtn], 'pics')
        const level1 = createComponent('EASY : 3 x 3', 'box level-btn')
        const level2 = createComponent('NORMAL : 4 x 4', 'box level-btn')
        const level3 = createComponent('HARD : 5 x 5', 'box level-btn')

        // 绑定难度选择事件
        level1.addEventListener('touchend', () => showGameScene(ele, 3, list, picIndex, pic.src));
        level2.addEventListener('touchend', () => showGameScene(ele, 4, list, picIndex, pic.src));
        level3.addEventListener('touchend', () => showGameScene(ele, 5, list, picIndex, pic.src));

        scene.appendChild(title);
        scene.appendChild(maps);
        scene.appendChild(level1);
        scene.appendChild(level2);
        scene.appendChild(level3);
        
        lastScene && ele.removeChild(lastScene)
        ele.appendChild(scene);
        lastScene = scene;
    }

    // 获取可移动位置
    function getMoveablePositions (position, level) {
        let result = [];
        if (position >= level)
            result.push(position - level)
        if (position + level < level * level)
            result.push(position + level)
        if (position % level !== 0) {
            result.push(position - 1)
        }
        if (position % level !== level - 1) {
            result.push(position + 1)
        }
        return result;
    }

    // 创建拼图网格
    function makeGrid (level, pic) {
        const gridBox = createComponent(null, 'box grid-box')
        const total = level * level;
        const list = [];

        // 创建拼图块
        for (let i = 0; i < total; i++) {
            const item = createComponent(null, 'grid grid-' + total + ' grid-' + i + '-' + total)
            item.style.borderRadius = '8px';
            item.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';

            if (i !== total - 1)
                item.style.backgroundImage = 'url("'+pic+'")';
            item.setAttribute('data-index', (i + 1) % total);

            let line = parseInt(i / level)
            let col = parseInt(i % level)
            item.style.backgroundPositionX = 'max(' + (0 - col * 90 / level) + 'vw, ' + (0 - col * 90 / level) + 'vh)'
            item.style.backgroundPositionY = 'max(' + (0 - line * 90 / level) + 'vw, ' + (0 - line * 90 / level) + 'vh)'

            // 随机打乱拼图
            let index = parseInt(Math.random() * list.length  + 0.5)
            list.splice(index, 0, item)
            gridBox.appendChild(item)
        }

        // 校验拼图可解性
        let checkVal = 0;
        list.map((item, index) => {
            let d = item.getAttribute('data-index') * 1;
            let tempC = list.reduce((prev, curr, ind) => prev += (curr.getAttribute('data-index') * 1 > d) && ind < index ? 1 : 0, 0);
            checkVal += tempC
            if (d === 0) {
                checkVal += parseInt(index / level)
                checkVal += parseInt(index % level)
            }
        })

        // 不可解则重新生成
        if (checkVal % 2 === level % 2)
            return makeGrid(level, pic)

        // 初始化可移动位置和空白块
        let moveAblePosition = [];
        let spaceItem = null;

        list.map((item, index) => {
            let line = parseInt(index / level)
            let col = parseInt(index % level)
            item.style.top = 'min(' + (line * 90 / level + 1) + 'vw, ' + (line * 90 / level + 1) + 'vh)';
            item.style.left = 'min(' + (col * 90 / level + 1) + 'vw, ' + (col * 90 / level + 1) + 'vh)';
            item.setAttribute('data-position', index)
            if (1 * item.getAttribute('data-index') === 0) {
                moveAblePosition = getMoveablePositions(index, level)
                spaceItem = item
                spaceItem.style.backgroundColor = '#f5f5f5'; // 空白块背景色
            }
        })

        // 拼图块点击事件
        gridBox.addEventListener('touchend', (event) => {
            if (!event.target.classList.contains('grid'))
                return;
            if (event.target.classList.contains('grid-' + (total - 1) + '-' + total))
                return;
                
            const targetPos = parseInt(event.target.getAttribute('data-position'));
            if (moveAblePosition.indexOf(targetPos) >= 0) {
                // 交换位置
                let {top, left} = event.target.style
                event.target.style.top = spaceItem.style.top
                event.target.style.left = spaceItem.style.left
                spaceItem.style.top = top
                spaceItem.style.left = left

                // 更新位置属性
                let position = event.target.getAttribute('data-position')
                event.target.setAttribute('data-position', spaceItem.getAttribute('data-position'))
                spaceItem.setAttribute('data-position', position)

                // 更新可移动位置
                moveAblePosition = getMoveablePositions(parseInt(position), level)
                const e = new Event("step");
                gridBox.dispatchEvent(e);
            }
        });

        // 检查拼图是否完成
        const checkFinished = () => {
            return list.reduce((prev, curr) => prev && parseInt(curr.getAttribute('data-index')) === (parseInt(curr.getAttribute('data-position')) + 1) % total, true)
        }

        return [gridBox, checkFinished];
    }

    // 游戏场景
    const showGameScene = (ele, level, list, picIndex, pic) => {
        const scene = createComponent(null, 'scene game-scene')
        let steps = 0;
        const stepInfo = createComponent(steps.toString(), 'step-info')
        const [grid, checkFinished] = makeGrid(level, pic)
        
        // 按钮创建
        const backBtn = createComponent('Back', 'action-btn box')
        const refreshBtn = createComponent('Restart', 'action-btn box')
        const actionInfo = createComponent([backBtn, refreshBtn], 'action-info')

        // 按钮事件
        backBtn.addEventListener('touchend', () => showLevelScene(ele, list, picIndex));
        refreshBtn.addEventListener('touchend', () => showGameScene(ele, level, list, picIndex, pic));
        
        // 组装场景
        scene.appendChild(createComponent(stepInfo, 'step-block'))
        scene.appendChild(grid)
        scene.appendChild(createComponent(actionInfo, 'action-block'))

        // 步数更新+完成检测
        grid.addEventListener('step', () => {
            steps++;
            stepInfo.textContent = steps;
            if (checkFinished()) {
                loadModal('Congratulations!', `You completed the puzzle in ${steps} steps!`, ()=>showLevelScene(ele, list, picIndex));
            }
        })
        
        lastScene && ele.removeChild(lastScene)
        ele.appendChild(scene);
        lastScene = scene;
    }

    // 初始化加载场景
    showLoading(d.body)

})(document);