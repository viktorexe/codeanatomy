const addCommentsBtn = document.getElementById('addCommentsBtn');
const removeCommentsBtn = document.getElementById('removeCommentsBtn');

addCommentsBtn.addEventListener('click', () => {
    window.location.href = '/editor?mode=add';
});

removeCommentsBtn.addEventListener('click', () => {
    window.location.href = '/editor?mode=remove';
});
