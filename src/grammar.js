function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.innerText);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    if (ev.target.classList.contains('slot') && !ev.target.innerText) {
        ev.target.innerText = data;
    }
}

// Clear slot on double click
document.querySelectorAll('.slot').forEach(slot => {
    slot.addEventListener('dblclick', function() {
        this.innerText = '';
    });
});

// Arrow navigation functionality
document.querySelectorAll('.arrow').forEach(arrow => {
    arrow.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Navigating to another question...');
    });
});