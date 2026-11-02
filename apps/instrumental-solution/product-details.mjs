const normalized = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

// Group the reviewed rows for reading; never alter their technical values.
export function specificationGroups(parameters) {
  const groups = [
    {id:'identificacion',title:'Identificación y construcción',rows:[]},
    {id:'medicion',title:'Medición y desempeño',rows:[]},
    {id:'proceso',title:'Condiciones de proceso',rows:[]},
    {id:'integracion',title:'Conexiones e integración',rows:[]},
  ];
  for (const row of parameters) {
    const key=normalized(row[0]);
    const group=/salida|alimentacion|comunicacion|conexion/.test(key)?3
      :/temperatura|presion de proceso|presion nominal|presion estatica|proteccion/.test(key)?2
      :/variable|funcion|tecnologia|frecuencia|rango|precision|angulo/.test(key)?1:0;
    groups[group].rows.push(row);
  }
  return groups.filter(group=>group.rows.length);
}

export function productResources(product) {
  return {
    manual:product.documents.some(doc=>/manual/i.test(`${doc.type??''} ${doc.title} ${doc.file??''}`)),
    video:Boolean(product.videos?.length||product.video),
  };
}
