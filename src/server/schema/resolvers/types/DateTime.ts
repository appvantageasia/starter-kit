import { GraphQLScalarType, Kind, GraphQLScalarTypeConfig } from 'graphql';

// Parses an RFC 3339 compliant date-time-string into a Date.
const parseDateTime = (dateTime: string): Date => new Date(dateTime);

// Function that checks whether a javascript Date instance
// is valid.
const validateJSDate = (date: Date): boolean => {
    const time = date.getTime();

    // eslint-disable-next-line no-self-compare
    return time === time;
};

// Check whether a certain year is a leap year.
//
// Every year that is exactly divisible by four
// is a leap year, except for years that are exactly
// divisible by 100, but these centurial years are
// leap years if they are exactly divisible by 400.
// For example, the years 1700, 1800, and 1900 are not leap years,
// but the years 1600 and 2000 are.
const leapYear = (year: number): boolean => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

// Function that checks whether a time-string is RFC 3339 compliant.
//
// It checks whether the time-string is structured in one of the
// following formats:
//
// - hh:mm:ssZ
// - hh:mm:ss±hh:mm
// - hh:mm:ss.*sZ
// - hh:mm:ss.*s±hh:mm
//
// Where *s is a fraction of seconds with at least 1 digit.
//
// Note, this validator assumes that all minutes have
// 59 seconds. This assumption does not follow RFC 3339
// which includes leap seconds (in which case it is possible that
// there are 60 seconds in a minute).
//
// Leap seconds are ignored because it adds complexity in
// the following areas:
// - The native Javascript Date ignores them; i.e. Date.parse('1972-12-31T23:59:60Z')
//   equals NaN.
// - Leap seconds cannot be known in advance.
export const validateTime = (time: string): boolean => {
    // eslint-disable-next-line max-len
    const TIME_REGEX =
        /^([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])(\.\d{1,})?(([Z])|([+|-]([01][0-9]|2[0-3]):[0-5][0-9]))$/;

    return TIME_REGEX.test(time);
};

// Function that checks whether a date-string is RFC 3339 compliant.
//
// It checks whether the date-string is a valid date in the YYYY-MM-DD.
//
// Note, the number of days in each date are determined according to the
// following lookup table:
//
// Month Number  Month/Year           Maximum value of date-mday
// ------------  ----------           --------------------------
// 01            January              31
// 02            February, normal     28
// 02            February, leap year  29
// 03            March                31
// 04            April                30
// 05            May                  31
// 06            June                 30
// 07            July                 31
// 08            August               31
// 09            September            30
// 10            October              31
// 11            November             30
// 12            December             31
export const validateDate = (datestring: string): boolean => {
    const RFC_3339_REGEX = /^(\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01]))$/;

    if (!RFC_3339_REGEX.test(datestring)) {
        return false;
    }

    // Verify the correct number of days for
    // the month contained in the date-string.
    const year = Number(datestring.substr(0, 4));
    const month = Number(datestring.substr(5, 2));
    const day = Number(datestring.substr(8, 2));

    switch (month) {
        case 2: // February
            if (leapYear(year) && day > 29) {
                return false;
            }

            return !(!leapYear(year) && day > 28);

        case 4: // April
        case 6: // June
        case 9: // September
        case 11: // November
            return day <= 30;

        default:
            return true;
    }
};

// Function that checks whether a date-time-string is RFC 3339 compliant.
//
// It checks whether the time-string is structured in one of the
//
// - YYYY-MM-DDThh:mm:ssZ
// - YYYY-MM-DDThh:mm:ss±hh:mm
// - YYYY-MM-DDThh:mm:ss.*sZ
// - YYYY-MM-DDThh:mm:ss.*s±hh:mm
//
// Where *s is a fraction of seconds with at least 1 digit.
//
const validateDateTime = (dateTimeString: string): boolean => {
    // Check if it is a correct date using the javascript Date parse() method.
    const time = Date.parse(dateTimeString);

    // eslint-disable-next-line no-self-compare
    if (time !== time) {
        return false;
    }

    // Split the date-time-string up into the string-date and time-string part.
    // and check whether these parts are RFC 3339 compliant.
    const index = dateTimeString.indexOf('T');
    const dateString = dateTimeString.substr(0, index);
    const timeString = dateTimeString.substr(index + 1);

    return validateDate(dateString) && validateTime(timeString);
};

/**
 * An RFC 3339 compliant date-time scalar.
 *
 * Input:
 *    This scalar takes an RFC 3339 date-time string as input and
 *    parses it to a javascript Date.
 *
 * Output:
 *    This scalar serializes javascript Dates,
 *    RFC 3339 date-time strings and unix timestamps
 *    to RFC 3339 UTC date-time strings.
 */
const config: GraphQLScalarTypeConfig<Date, Date> = {
    name: 'DateTime',
    description:
        'A date-time string at UTC, such as 2007-12-03T10:15:30Z, ' +
        'compliant with the `date-time` format outlined in section 5.6 of ' +
        'the RFC 3339 profile of the ISO 8601 standard for representation ' +
        'of dates and times using the Gregorian calendar.',
    serialize(value) {
        if (value instanceof Date) {
            if (validateJSDate(value)) {
                return value;
            }
            throw new TypeError('DateTime cannot represent an invalid Date instance');
        } else if (typeof value === 'string') {
            if (validateDateTime(value)) {
                return parseDateTime(value);
            }
            throw new TypeError(`DateTime cannot represent an invalid date-time-string ${value}.`);
        } else if (typeof value === 'number') {
            try {
                return new Date(value);
            } catch (e) {
                throw new TypeError(`DateTime cannot represent an invalid Unix timestamp ${value}`);
            }
        } else {
            throw new TypeError(
                `${'DateTime cannot be serialized from a non string, non numeric or non Date type '}${JSON.stringify(
                    value
                )}`
            );
        }
    },
    parseValue(value) {
        if (value instanceof Date) {
            if (validateJSDate(value)) {
                return value;
            }
            throw new TypeError('DateTime cannot represent an invalid Date instance');
        }
        if (typeof value === 'string') {
            if (validateDateTime(value)) {
                return parseDateTime(value);
            }
            throw new TypeError(`DateTime cannot represent an invalid date-time-string ${value}.`);
        }
        throw new TypeError(`DateTime cannot represent non string or Date type ${JSON.stringify(value)}`);
    },
    parseLiteral(ast) {
        if (ast.kind !== Kind.STRING) {
            throw new TypeError(`DateTime cannot represent non string or Date type ${'value' in ast && ast.value}`);
        }
        const { value } = ast;
        if (validateDateTime(value)) {
            return parseDateTime(value);
        }
        throw new TypeError(`DateTime cannot represent an invalid date-time-string ${String(value)}.`);
    },
};

const DateTime = new GraphQLScalarType(config);

export default DateTime;
