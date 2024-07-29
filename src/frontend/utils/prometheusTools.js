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

    // Non-labelled metrics are assigned directly to result {metric: value}
    // e.g. queue size
    if (!metricNameWithLabels.includes('{')) {
      result[metricNameWithLabels] = value;
      return;
    }

    // Otherwise get the metric name and labels
    const [metricName, labelPart] = metricNameWithLabels.split('{');

    // Remove the closing curly brace
    const labelContent = labelPart.slice(0, -1);

    // Get associated labels
    const labels = parseLabels(labelContent);

    const topic = labels.topic;
    const fileType = labels.file_type;

    // Add the topic to the object if it doesn't exist
    if (!result[topic]) {
      result[topic] = {};
    }

    // Labelled metrics without file type are assigned to metric:
    // {topic: {metric: value}}
    if (!fileType) {
      result[topic][metricName] = value;
      return;
    }

    // Labelled metrics with file type are nested:
    // {topic: {metric: {fileType: value}}}
    if (!result[topic][metricName]) {
      result[topic][metricName] = {};
    }

    result[topic][metricName][fileType] = value;
  });

  return result;
}

function parseLabels(labelPart) {
  const labels = {};

  // Get each key value label pair
  const labelPairs = labelPart.split(',');

  // Split each pair into key and value
  // e.g. centre_id="in-imd" -> [centre_id, in-imd]
  labelPairs.forEach(labelPair => {
    const [key, value] = labelPair.split('=');

    // Remove quotes from the value
    labels[key] = value.replace(/"/g, '');
  });

  return labels;
}
