$(document).ready(function($) {
    var e0 = $(document).find('.screen_data');
    var s1 = $(document).find('.screen_home').html();
    e0.html(s1);

    $(document).on('click', '.btn_menu', function(event) {
        event.preventDefault();
        var screen_name = $(this).attr('screen_name');


        window.location.hash = '/' + screen_name;
        $(document).find('.screen_name').html(screen_name);

        if(screen_name == "home") {
            var s1 = $(document).find('.screen_home').html();
            e0.html(s1);
        } else if(screen_name == "about") {
            var s1 = $(document).find('.screen_about').html();
            e0.html(s1);
        }
    });

        // Function to submit custom JSON file
        $(document).on('click', '#submitFileBtn', function() {
            var file = $('#fileInput').prop('files')[0];
            if (file) {
                var reader = new FileReader();
                reader.readAsText(file, 'UTF-8');
                reader.onload = function(event) {
                    var jsonData = JSON.parse(event.target.result);
                    // Update UI with loaded data
                    createPieChart(jsonData.activities); // Create pie chart based on loaded data
                };
                reader.onerror = function() {
                    alert("Error reading file!");
                };
            } else {
                alert("Please select a file.");
            }
        });

        // Function to create pie chart
        function createPieChart(activities) {
            // Sort activities by hours (descending order)
            activities.sort((a, b) => b.hours - a.hours);

            const canvas = document.getElementById("pieChart");
            const ctx = canvas.getContext("2d");
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY);

            let startAngle = 0;

            activities.forEach(activity => {
                const sliceAngle = (activity.hours / getTotalHours(activities)) * (Math.PI * 2);

                ctx.fillStyle = activity.color;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                ctx.closePath();
                ctx.fill();

                // Draw text label
                const labelAngle = startAngle + sliceAngle / 2;
                const labelX = centerX + (radius / 2) * Math.cos(labelAngle);
                const labelY = centerY + (radius / 2) * Math.sin(labelAngle);
                ctx.fillStyle = "black";
                ctx.font = "12px Arial";
                ctx.fillText(activity.name + ": " + activity.hours + " hours", labelX, labelY);

                startAngle += sliceAngle;
            });
        }


        // Function to get total hours
        function getTotalHours(activities) {
            return activities.reduce((total, activity) => total + activity.hours, 0);
        }


        var activities = []; // Array to store entered activities

        // Function to determine the color based on hours
        function getColorForHours(hours) {
            if (hours <= 2) {
                return 'green'; // Less than or equal to 2 hours is green
            } else if (hours <= 6) {
                return 'yellow'; // More than 2 hours but less than or equal to 6 hours is yellow
            } else {
                return 'red'; // More than 6 hours is red
            }
        }

        // Event listener for the "Add Activity" button
        $(document).on('click', '#addActivityBtn', function() {
            var activityName = $('#activityName').val();
            var activityHours = $('#activityHours').val();

            // Validate input fields
            if (activityName.trim() === '' || isNaN(activityHours) || activityHours <= 0) {
                alert('Please enter valid activity details.');
                return;
            }

            // Determine color based on hours
            var activityColor = getColorForHours(parseInt(activityHours));

            // Create an object for the activity
            var activity = {
                id: Date.now(),
                name: activityName,
                hours: parseInt(activityHours),
                color: activityColor
            };

            // Add the activity to the activities array
            activities.push(activity);


            // Add activity to the list
            addActivityToList(activity);

            // Clear input fields
            $('#activityName').val('');
            $('#activityHours').val('');
        });

        // Function to add activity to the list
        function addActivityToList(activity) {
            var activityItem = $('<div class="activity-item">' + activity.name + ': ' + activity.hours + ' hours <button class="remove-activity" data-id="' + activity.id + '">X</button></div>');

            // Event listener to remove activity when X button is clicked
            activityItem.find('.remove-activity').click(function() {
                var idToRemove = $(this).data('id');
                // Remove the activity from the activities array
                activities = activities.filter(item => item.id !== idToRemove);
                // Remove the activity item from the list
                $(this).parent().remove();
            });

            $('#activityList').append(activityItem);
        }

        function saveJSONData(activities) {
            // Create JSON data containing all activities
            var jsonData = { activities: activities };
            var jsonString = JSON.stringify(jsonData, null, 2);

            // Save JSON data to time_data.json file
            var blob = new Blob([jsonString], { type: "application/json" });
            var url = URL.createObjectURL(blob);
        
            var a = document.createElement('a');
            a.href = url;
            a.download = 'time_data.json';
            a.click();
            URL.revokeObjectURL(url);
            alert("Data saved successfully!");
        }

        // Function to save data to a new JSON file
        $(document).on('click', '#saveDataBtn', function() {
            saveJSONData(activities);
            activities = [];
            $('#activityList').empty();
            console.log("Saving data");
        });
});