
export const setItem = async (data: string) => {
    if(!data)
        return;

    const currentDate = new Date();
    const timestamp = currentDate.getTime();
    localStorage.setItem('weather_'+timestamp.toString(), data);
};


export const getItem = async (key?: string) => {
    if(!key){
        return Object.keys(localStorage).map(function(key){
            if(key.includes('weather_'))
            return {[key]: JSON.parse(localStorage.getItem(key) ?? '')}
        });
    }

    const data = localStorage.getItem(key ?? '');
    if(!data)
        return;
    return JSON.parse(data);
};

export const removeItem = async (key?: string) => {
    if(!key) return;

    localStorage.removeItem(key);
};