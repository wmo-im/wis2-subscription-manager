export function topicsIntersect(topic1, topic2) {

    // Quick check for exact match
    if (topic1 === topic2) {
        return true;
    }

    const topic1Levels = topic1.split('/');
    const topic2Levels = topic2.split('/');

    const maxLength = Math.max(topic1Levels.length, topic2Levels.length);

    for (let i = 0; i < maxLength; i++) {
        const topic1Level = topic1Levels[i];
        const topic2Level = topic2Levels[i];

        // Six possible cases:
        // 1. One of the topics has ended (undefined level), and the previous level is a # wildcard -> True
        // 2. One of the levels is a # wildcard -> True
        // 3. Both levels are identical -> Continue
        // 4. Both levels have + or # wildcards -> Continue
        // 5. One level is a + wildcard and the other isn't -> Continue
        // 6. Neither level is a wildcard and they don't match -> False
        
        if (topic1Level === undefined || topic2Level === undefined) {
            return topic1Levels[i - 1] === '#' || topic2Levels[i - 1] === '#';
        }

        if (topic1Level === '#' || topic2Level === '#') {
            return true;
        }

        if (topic1Level === topic2Level) {
            continue;
        }

        if ((topic1Level === '+' || topic1Level === '#') &&
            (topic2Level === '+' || topic2Level === '#')) {
            continue;
        }

        if ((topic1Level === '+' || topic2Level === '+') && (topic1Level !== topic2Level)) {
            continue;
        }

        if (topic1Level !== topic2Level) {
            return false;
        }
    }

    // If all levels pass, the topics intersect
    return true;
};