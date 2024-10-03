function makeString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}
export const createContactListMockData = (count = 20) => {
    return new Array(count).fill(0).map(() => ({
        name: `${makeString(10)} ${makeString(15)}`,
        address: `${makeString(5)}, ${makeString(10)}`,
        jobTitle: makeString(10),
    }));
};
