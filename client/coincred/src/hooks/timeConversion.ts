


function parseDateString(dateStr: string): Date {
    // Replace ordinal suffixes (1st, 2nd, 3rd, 4th, etc.) with empty string
    const dateWithoutSuffix = dateStr.replace(/(\d+)(st|nd|rd|th)/, '$1');
    
    // Parse the date string
    const date = new Date(dateWithoutSuffix);
    
    // Check if the parsed date is valid
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
    }
    
    return date;
}

// Function to convert seconds to days and hours
export function convertSecondsToDaysHours(seconds: number): { days: number, hours: number } {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    return { days, hours };
}

// Function to count down from duration to the current time
export function countdown(startTime: number, endTime: number): string {
    const now = Math.floor(Date.now() / 1000); // current time in seconds
  
    const remainingTime = startTime - endTime;
    

    if (remainingTime <= 0) {
        return "Time is up!";
    }

    const { days, hours } = convertSecondsToDaysHours(remainingTime);
    return `Time remaining: ${days} days and ${hours} hours`;
}

export function secondsFromNow(targetDate: Date|undefined): number {
    if (!(targetDate instanceof Date) || isNaN(targetDate.getTime())) {
        throw new TypeError('Input must be a valid Date object');
    }

    // Get the current date and time
    const now = new Date();

    // Calculate the difference in milliseconds
    const differenceInMillis = targetDate.getTime() - now.getTime();

    // Convert milliseconds to seconds
    const differenceInSeconds = Math.floor(differenceInMillis / 1000);

    return differenceInSeconds;
}


