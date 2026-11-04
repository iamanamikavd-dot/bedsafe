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

    // ==========================================
    // Calculate Risk
    // ==========================================

    function getRisk(pressure) {

        pressure = Number(pressure) || 0;

        if (pressure < 500) {
            return "Low";
        }

        else if (pressure < 1500) {
            return "Medium";
        }

        else {
            return "High";
        }
    }


    // ==========================================
    // Format Time
    // ==========================================

    function formatTime(time) {

        if (!time) {
            return "--";
        }

        const date = new Date(time);

        if (isNaN(date.getTime())) {
            return time;
        }

        return date.toLocaleString();
    }


    // ==========================================
    // Display Alerts
    // ==========================================

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


        alertList.forEach((alert) => {

            const pressure = Number(alert.pressure) || 0;

            const risk = getRisk(pressure);

            let riskClass = "low";

            if (risk === "High") {
                riskClass = "high";
            }

            else if (risk === "Medium") {
                riskClass = "medium";
            }


            const status =
                alert.status || "Pending";

            const statusClass =
                status === "Completed"
                ? "completed"
                : "pending";


            tableBody.innerHTML += `

                <tr>

                    <td>
                        ${alert.patientName || "Unknown"}
                    </td>

                    <td>
                        ${pressure}
                    </td>

                    <td class="${riskClass}">
                        ${risk}
                    </td>

                    <td>
                        ${formatTime(alert.time)}
                    </td>

                    <td class="${statusClass}">
                        ${status}
                    </td>

                    <td>

                        <button
                            class="view"
                            onclick="viewAlert('${alert.id}')">

                            <i class="fa-solid fa-eye"></i>

                        </button>

                        <button
                            class="delete"
                            onclick="deleteAlert('${alert.id}')">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </td>

                </tr>

            `;

        });

    }


    // ==========================================
    // Read Alerts from Firebase
    // ==========================================

    const alertsRef = ref(database, "alertHistory");

    onValue(
        alertsRef,

        (snapshot) => {

            alerts = [];

            snapshot.forEach((childSnapshot) => {

                alerts.push({

                    id: childSnapshot.key,

                    ...childSnapshot.val()

                });

            });

            // Latest alerts first
            alerts.reverse();

            displayAlerts(alerts);

        },

        (error) => {

            console.error(
                "Error loading alerts:",
                error
            );

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        Error loading alerts.
                    </td>
                </tr>
            `;

        }
    );


    // ==========================================
    // Search Alerts
    // ==========================================

    searchInput.addEventListener("keyup", function () {

        const value =
            this.value.toLowerCase().trim();


        const filtered = alerts.filter(alert => {

            const patientName =
                String(alert.patientName || "")
                .toLowerCase();

            const pressure =
                String(alert.pressure || "")
                .toLowerCase();

            const risk =
                getRisk(alert.pressure)
                .toLowerCase();

            const status =
                String(alert.status || "")
                .toLowerCase();


            return (
                patientName.includes(value) ||
                pressure.includes(value) ||
                risk.includes(value) ||
                status.includes(value)
            );

        });


        displayAlerts(filtered);

    });

});


// ==========================================
// View Alert
// ==========================================

window.viewAlert = function(alertId) {

    const selectedAlert =
        alerts.find(alert => alert.id === alertId);


    if (!selectedAlert) {
        alert("Alert not found.");
        return;
    }


    const pressure =
        Number(selectedAlert.pressure) || 0;

    const risk =
        getRiskForView(pressure);


    alert(

`Patient : ${selectedAlert.patientName || "Unknown"}

Pressure : ${pressure}

Risk : ${risk}

Time : ${formatTimeForView(selectedAlert.time)}

Status : ${selectedAlert.status || "Pending"}`

    );

};


// ==========================================
// Helper for View Alert
// ==========================================

function getRiskForView(pressure) {

    if (pressure < 500) {
        return "Low";
    }

    else if (pressure < 1500) {
        return "Medium";
    }

    else {
        return "High";
    }

}


function formatTimeForView(time) {

    if (!time) {
        return "--";
    }

    const date = new Date(time);

    if (isNaN(date.getTime())) {
        return time;
    }

    return date.toLocaleString();

}


// ==========================================
// Delete Alert
// ==========================================

window.deleteAlert = async function(alertId) {

    const confirmDelete =
        confirm("Delete this alert?");


    if (!confirmDelete) {
        return;
    }


    try {

        await remove(
            ref(
                database,
                "alertHistory/" + alertId
            )
        );


        alert("Alert deleted successfully.");

    }

    catch (error) {

        console.error(
            "Delete error:",
            error
        );

        alert(
            "Unable to delete alert: " +
            error.message
        );

    }

};