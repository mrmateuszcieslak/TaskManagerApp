document.addEventListener("DOMContentLoaded", () => {
    const taskForm = document.getElementById("task-form");
    const taskInput = document.getElementById("task-input");
    const dateInput = document.getElementById("date-input");
    const statusInput = document.getElementById("status-input");
    const taskList = document.getElementById("task-list");
    const filterInput = document.getElementById("filter-input");

    // Odczytaj zadania z localStorage po za³adowaniu strony
    loadTasks();

    taskForm.addEventListener("submit", (e) => {
        e.preventDefault();
        addTask(taskInput.value, dateInput.value, statusInput.value);
        taskInput.value = "";
        dateInput.value = "";
        statusInput.value = "Do zrobienia";
    });

    document.getElementById("sort-asc").addEventListener("click", () => sortTasks("asc"));
    document.getElementById("sort-desc").addEventListener("click", () => sortTasks("desc"));
    document.getElementById("sort-date-asc").addEventListener("click", () => sortTasksByDate("asc"));
    document.getElementById("sort-date-desc").addEventListener("click", () => sortTasksByDate("desc"));
    document.getElementById("download-pdf").addEventListener("click", () => downloadPDF());
    document.getElementById("download-json").addEventListener("click", () => downloadJSON());

    filterInput.addEventListener("keyup", () => filterTasks(filterInput.value));

    function addTask(task, date, status) {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${task}</span>
            <span>${date}</span>
            <span>${status}</span>
            <button class="edit-button">Edit</button>
            <button class="delete-button">Delete</button>
        `;
        taskList.appendChild(li);

        li.querySelector(".delete-button").addEventListener("click", () => {
            taskList.removeChild(li);
            saveTasks();  // Zapisz zadania po usuniêciu
        });

        li.querySelector(".edit-button").addEventListener("click", () => {
            taskInput.value = task;
            dateInput.value = date;
            statusInput.value = status;
            taskList.removeChild(li);
            saveTasks();  // Zapisz zadania po edytowaniu
        });

        saveTasks();  // Zapisz zadania po dodaniu nowego zadania
    }

    function sortTasks(order) {
        const tasks = Array.from(taskList.getElementsByTagName("li"));
        tasks.sort((a, b) => {
            const taskA = a.getElementsByTagName("span")[0].innerText.toLowerCase();
            const taskB = b.getElementsByTagName("span")[0].innerText.toLowerCase();
            if (order === "asc") {
                return taskA < taskB ? -1 : taskA > taskB ? 1 : 0;
            } else {
                return taskA > taskB ? -1 : taskA < taskB ? 1 : 0;
            }
        });
        taskList.innerHTML = "";
        tasks.forEach((task) => taskList.appendChild(task));
        saveTasks();  // Zapisz zadania po sortowaniu
    }

    function sortTasksByDate(order) {
        const tasks = Array.from(taskList.getElementsByTagName("li"));
        tasks.sort((a, b) => {
            const dateA = new Date(a.getElementsByTagName("span")[1].innerText);
            const dateB = new Date(b.getElementsByTagName("span")[1].innerText);
            return order === "asc" ? dateA - dateB : dateB - dateA;
        });
        taskList.innerHTML = "";
        tasks.forEach((task) => taskList.appendChild(task));
        saveTasks();  // Zapisz zadania po sortowaniu
    }

    function filterTasks(query) {
        const tasks = Array.from(taskList.getElementsByTagName("li"));
        tasks.forEach((task) => {
            const taskText = task.getElementsByTagName("span")[0].innerText.toLowerCase();
            if (taskText.includes(query.toLowerCase())) {
                task.style.display = "";
            } else {
                task.style.display = "none";
            }
        });
    }

    function downloadPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Lista zadañ", 105, 20, null, null, "center");

        // Ustawienia kolumn
        const columns = ["Zadanie", "Data", "Status"];
        const columnPositions = [20, 90, 150];

        // Rysowanie nag³ówków kolumn
        doc.setFontSize(12);
        columns.forEach((column, index) => {
            doc.text(column, columnPositions[index], 30);
        });

        // Rysowanie linii oddzielaj¹cej nag³ówek od danych
        doc.line(20, 32, 190, 32);

        const tasks = Array.from(taskList.getElementsByTagName("li"));
        tasks.forEach((task, index) => {
            const taskText = task.getElementsByTagName("span")[0].innerText;
            const taskDate = task.getElementsByTagName("span")[1].innerText;
            const taskStatus = task.getElementsByTagName("span")[2].innerText;

            const rowPosition = 40 + (10 * index);

            doc.text(taskText, 20, rowPosition);
            doc.text(taskDate, 90, rowPosition);
            doc.text(taskStatus, 150, rowPosition);
        });
        doc.save("task-list.pdf");
    }

    function downloadJSON() {
        const tasks = Array.from(taskList.getElementsByTagName("li")).map((task) => {
            const taskText = task.getElementsByTagName("span")[0].innerText;
            const taskDate = task.getElementsByTagName("span")[1].innerText;
            const taskStatus = task.getElementsByTagName("span")[2].innerText;
            return {
                task: taskText,
                date: taskDate,
                status: taskStatus
            };
        });

        const json = JSON.stringify(tasks, null, 2);

        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "task-list.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // Zapisz zadania do localStorage
    function saveTasks() {
        const tasks = Array.from(taskList.getElementsByTagName("li")).map((task) => {
            return {
                task: task.getElementsByTagName("span")[0].innerText,
                date: task.getElementsByTagName("span")[1].innerText,
                status: task.getElementsByTagName("span")[2].innerText
            };
        });
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    // Odczytaj zadania z localStorage i za³aduj na stronê
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks.forEach((task) => {
            addTask(task.task, task.date, task.status);
        });
    }
});
