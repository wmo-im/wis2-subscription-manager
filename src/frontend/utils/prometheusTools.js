export function parsePrometheusText(data) {

    // Initalise object
    const result = {};

    // Split the data into lines
    const lines = data.split('\n');

    lines.forEach(line => {
        // Skip comments and empty lines
        if (line.startsWith('#') || line.trim() === '') {
            return;
        }

        // Metric type + labels and value are separated by a space
        const [metricNameWithLabels, valueString] = line.split(' ');
        const value = parseFloat(valueString);

        // Non-labelled result have no curly braces
        if (!metricNameWithLabels.includes('{')) {
            result[metricNameWithLabels] = value;
            return;
        }

        // Otherwise get the metric name and labels
        const [metricName, labelPart] = metricNameWithLabels.split('{');

        // Remove the closing curly brace
        const labelContent = labelPart.slice(0, -1);

        // Get associated labels
        const labels = {};

        labelContent.split(',').forEach(label => {
            const [key, value] = label.split('=');
            labels[key] = value;
        });

        // Add the metric to the object if it doesn't exist
        if (!result[metricName]) {
            result[metricName] = [];
        }

        result[metricName].push({ ...labels, value });
    })

    return result;
}