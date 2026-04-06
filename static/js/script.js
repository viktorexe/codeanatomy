document.getElementById('cardAddComments').addEventListener('click', () => {
    window.location.href = '/editor?mode=add';
});

document.getElementById('cardRemoveComments').addEventListener('click', () => {
    window.location.href = '/editor?mode=remove';
});

document.getElementById('cardVisualize').addEventListener('click', () => {
    window.location.href = '/anatomy';
});

document.getElementById('cardComplexity').addEventListener('click', () => {
    window.location.href = '/analysis';
});
