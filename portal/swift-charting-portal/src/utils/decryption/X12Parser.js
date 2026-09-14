const findX12Details = (obj,type) => {
    let results = [];
  
    const search = (o) => {
      if (o && typeof o === "object") {
        Object.entries(o).forEach(([key, value]) => {
          if (key.startsWith(type)) {
            results.push(value);
          } else if (typeof value === "object") {
            search(value);
          }
        });
      }
    };
    search(obj);
    return results;
  };

  
export {
    findX12Details,
  };
  