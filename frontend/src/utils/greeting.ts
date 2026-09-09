/**
 * Returns a time-based greeting string and emoji based on the user's local time.
 *
 * 05:00 – 11:59 → Good Morning  🌅
 * 12:00 – 16:59 → Good Afternoon ☀️
 * 17:00 – 20:59 → Good Evening  🌆
 * 21:00 – 04:59 → Good Night    🌙
 */
export function getDynamicGreeting(): { greeting: string; emoji: string } {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return { greeting: 'Good Morning', emoji: '🌅' };
    } else if (hour >= 12 && hour < 17) {
        return { greeting: 'Good Afternoon', emoji: '☀️' };
    } else if (hour >= 17 && hour < 21) {
        return { greeting: 'Good Evening', emoji: '🌆' };
    } else {
        return { greeting: 'Good Night', emoji: '🌙' };
    }
}
