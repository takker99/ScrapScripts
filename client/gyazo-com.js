window.app = /Chrome/.test(navigator.userAgent) ? chrome : browser;

$(() => {
    window.daiizGyazo.manage.install().then((projectName) => {
        window.daiizGyazo.textBubble.enable(projectName);
    });
});
