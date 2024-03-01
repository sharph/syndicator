
export async function load({ parent }) {
    return {
        parent: await parent()
    };
}