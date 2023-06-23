import createElement from '../helpers/domHelper';
import icons from '../helpers/icons';

export function createFighterImage(fighter) {
    const { source, name } = fighter;
    const attributes = {
        src: source,
        title: name,
        alt: name,
        height: 395
    };
    const imgElement = createElement({
        tagName: 'img',
        className: 'fighter-preview___img',
        attributes
    });

    return imgElement;
}

export function createFighterPreview(fighter, position) {
    if (!fighter) {
        return createElement({ tagName: 'div' });
    }
    const positionClassName = position === 'right' ? 'fighter-preview___right' : 'fighter-preview___left';
    const fighterElement = createElement({
        tagName: 'div',
        className: `fighter-preview___root ${positionClassName}`
    });

    // todo: show fighter info (image, name, health, etc.)
    const infoElements = [];
    Object.entries(fighter).forEach(([key, value]) => {
        if (key === '_id' || key === 'source') {
            return;
        }
        const infoElement = createElement({
            tagName: 'div',
            className: 'fighter-preview___info'
        });
        const infoName = createElement({
            tagName: 'div',
            className: 'fighter-preview___subtitle'
        });
        infoName.textContent = key;
        const icon = createElement({ tagName: 'div', className: 'fighter-preview___icon' });
        icon.innerHTML = icons[key];
        if (key === 'health') {
            icon.style.color = 'red';
        }
        infoName.prepend(icon);
        const infoValue = createElement({
            tagName: 'div',
            className: 'fighter-preview___txt'
        });
        infoValue.textContent = value;
        infoElement.append(infoName, infoValue);
        infoElements.push(infoElement);
    });
    const fighterInfo = createElement({
        tagName: 'div',
        className: `fighter-preview___info-block`
    });
    fighterInfo.append(...infoElements);

    const fighterImage = createFighterImage(fighter);
    fighterElement.append(fighterImage, fighterInfo);

    return fighterElement;
}
