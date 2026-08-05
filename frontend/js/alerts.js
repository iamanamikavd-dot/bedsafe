import { database } from "./firebase-config.js";

import {
    ref,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

// ==========================================
// BedSafe - Alert History
// ==========================================

let alerts = [];

document.addEventListener("DOMContentLoaded", () => {

    const tableBody = document.getElementById("alertTable");
    const searchInput = document.getElementById("searchAlert");

    // Display Alerts
    function displayAlerts(alertList) {

        tableBody.innerHTML = "";

        if (alertList.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        No alerts available.
                    </td>
                </tr>
            `;

            return;
        }

        alertList.forEach((alert, index) => {

            let riskClass = "low";

            if (alert.risk === "High")
                riskClass = "high";

            else if (alert.risk === "Medium")
                riskClass = "medium";

            let statusClass =
                alert.status === "Completed"
                ? "completed"
                : "pending";

            tableBody.innerHTML += `

                <tr>

                    <td>${alert.patientName}</td>

                    <td>${alert.pressure}%</td>

                    <td class="${riskClass}">
                        ${alert.risk}
                    </td>

                    <td>${alert.time}</td>

                    <td class="${statusClass}">
                        ${alert.status}
                    </td>

                    <td>

                        <button
                            class="view"
                            onclick="viewAlert(${index})">

                            <i class="fa-solid fa-eye"></i>

                        </button>

                        <button
                            class="delete"
                            onclick="deleteAlert(${index})">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </td>

                </tr>

            `;

        });

    }

    // Read Alerts from Firebase

    const alertsRef = ref(database, "alerts");

    onValue(alertsRef, (snapshot) => {

        alerts = [];

        snapshot.forEach((childSnapshot) => {

            alerts.push({

                id: childSnapshot.key,

                ...childSnapshot.val()

            });

        });

        displayAlerts(alerts);

    });

    // Search Alerts

    searchInput.addEventListener("keyup", function () {

        const value = this.value.toLowerCase();

        const filtered = alerts.filter(alert =>

            alert.patientName.toLowerCase().includes(value) ||

            alert.risk.toLowerCase().includes(value)

        );

        displayAlerts(filtered);

    });

});

// View Alert

window.viewAlert = function(index) {

    const alert = alerts[index];

    alert(

`Patient : ${alert.patientName}

Pressure : ${alert.pressure}%

Risk : ${alert.risk}

Time : ${alert.time}

Status : ${alert.status}`

    );

};

// Delete Alert

window.deleteAlert = async function(index) {

    const confirmDelete =
        confirm("Delete this alert?");

    if (!confirmDelete) return;

    try {

        const alertId = alerts[index].id;

        await remove(ref(database, "alerts/" + alertId));

        alert("Alert deleted successfully.");

    }

    catch(error){

        alert(error.message);

    }

};