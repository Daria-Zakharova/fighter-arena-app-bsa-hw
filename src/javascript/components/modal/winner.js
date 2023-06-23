// eslint-disable-next-line import/no-cycle
import App from '../../app';
import showModal from './modal';

export default function showWinnerModal(fighter) {
    // call showModal function
    showModal({
        title: `${fighter.name} wins!!!`,
        bodyElement: `This is a little step on a great way. Fighter is grateful for your wise but ruthless guidance. See you in fight.`,
        onClose: () => {
            const root = document.getElementById('root');
            root.innerHTML = '';
            App.startApp();
        }
    });
}
