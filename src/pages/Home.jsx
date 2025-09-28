import React, { useEffect, useState } from 'react'
import CardGeneralInfo from '../components/Cards/CardGeneralInfo'
import { useAuth } from '../context/AuthContext';
import PageBackground from '../components/UI/Background/PageBackground';
import CardInfo from '../components/Cards/CardInfo';
import Table from '../components/Table/Table';
import { getTransfers } from '../services/transferService';
import { getOrders } from '../services/orderService';
import { getAllSpareParts, getSparePartsByLocation } from '../services/sparePartService';
import { getAllRegions, getAllLocations } from '../services/dataService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { es } from 'date-fns/locale';
import { a, filter, span, tr } from 'framer-motion/client';

const theadTextTransfer = ['Almacén Destinatario', 'Día de Transferencia', 'Día de llegada', 'Estado'];
const theadTextOrders = ['WO', 'Fecha realizada', 'Estado']

export default function Dashboard() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sparePartFilter, setSparePartFilter] = useState([]);
  const [spareLowStock, setSpareLowStock] = useState([]);
  const [countSpareLowStock, setCountSpareLowStock] = useState([]);
  const [totalStock, setTotalStock] = useState([]);

  const [totalTransfers, setTotalTransfers] = useState('');
  const [totalOrders, setTotalOrders] = useState('');

  const [transfersDataChart, setTransfersDataChart] = useState([]);
  const [ordersDataChart, setOrdersDataChart] = useState([]);


  const [transferAlerts, setTransferAlerts] = useState([]);
  const [regions, setRegions] = useState([]);
  const [locations, setLocations] = useState([]);

  const [avgTimeTransfer, setAvgTimeTransfer] = useState('');
  const [avgTimeOrder, setAvgTimeOrder] = useState('');

  const [range, setRange] = useState("Últimos 7 días");
  const [data, setData] = useState([]);


  const isAdmin = userData?.roles === 'Jefe de Logística';

  const theadStkCrit = isAdmin ? ['# Parte', 'Descripción','Stock', 'Nivel', 'Almacen'] : ['# Parte', 'Descripción','Stock', 'Nivel'];
  const theadSpareMostInDemand = ['# Parte', 'Cantidad solicitada'];
  const theadIncomTransf = isAdmin ? ['Fecha reportada', 'Origen', 'Destinatario', 'Estado'] : ['Fecha reportada', 'Origen', 'Estado'];
  
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  

  useEffect(() => {
    const loadIncomingTransfers = async () => {
      try {
        const allTransfers = await getTransfers();
        let filteredTransf = [];
        if (isAdmin) {
          filteredTransf = allTransfers.filter(t => t.statusTransf === "En tránsito" || t.statusTransf === "Pendiente");
        } else {
          const userLocId = userData?.locId;
          filteredTransf = allTransfers.filter(t => t.destinyLocation.idLoc === userLocId && t.statusTransf === "En tránsito" || t.statusTransf === "Pendiente");
        }

        setTransferAlerts(filteredTransf);
        
      } catch (error) {
        console.error('Error al cargar las transferencias entrantes:', error);
      } finally {
        setLoading(false);
      }
    };
    if(userData?.locId || isAdmin) loadIncomingTransfers();
  }, [userData]);

  //INVENTORY LOGIC
  //Total Stock
  useEffect(() => {
    const fetchData = async () => {
      try {
        let countStock = 0;

        if (isAdmin) {
          let allSpares = await getAllSpareParts();
          for (const spare of allSpares) {
            for (const stock of spare.sparePartStocks) {
              countStock += stock.quantity;
            }
          }
        } else {
          const userLocId = userData?.locId;
          let sparesAtLocation = await getSparePartsByLocation(userLocId);

          for (const spare of sparesAtLocation) {
            const stock = spare.sparePartStocks.find(s => s.idLoc === userLocId);
            if (stock) {
              countStock += stock.quantity;
            }
          }
        }

        setTotalStock(countStock);
      } catch (error) {
        console.error('Error al cargar datos: ', error);
      } finally {
        setLoading(false);
      }
    };
    if(userData?.locId || isAdmin) fetchData();
  }, [userData]);
  //Low Stock
  useEffect(() => {
    const fetchData = async () => {
      try {
        
        if (isAdmin) {
          let allSpares = await getAllSpareParts();
          const lowStockSpare = allSpares.filter(spare => {
            return spare.sparePartStocks.some(stock => stock.quantity <= 5);
          });
          setCountSpareLowStock(lowStockSpare.length);
          setSpareLowStock(lowStockSpare.slice(0,5))
        } else {
          const userLocId = userData?.locId;
          let sparesAtLocation = await getSparePartsByLocation(userLocId);
          const lowStockSpare = sparesAtLocation.filter(spare => {
            const stock = spare.sparePartStocks.find(s => s.idLoc === userLocId);
            return stock && stock.quantity <= 5;
          });
          
          setCountSpareLowStock(lowStockSpare.length);
          setSpareLowStock(lowStockSpare.slice(0,5));          
        }
      } catch (error) {
        console.error('Error al cargar datos: ', error);
      } finally {
        setLoading(false);
      }
    };
    if(userData?.locId || isAdmin) fetchData();
  }, [userData]);
  //The most requested
  useEffect(() => {
    const fetchData = async () => {
      try {
        let allOrders = await getOrders();
        let filteredOrders = [];
        let sparesAtLocation = [];

        if (isAdmin) {
          filteredOrders = allOrders;
          sparesAtLocation = await getAllSpareParts();
        } else {
          const userLocId = userData?.locId;
          filteredOrders = allOrders.filter(o => o.idLoc === userLocId);
          sparesAtLocation = await getSparePartsByLocation(userLocId);
        }
        const dataSorted = buildSparePartFilter(filteredOrders, sparesAtLocation);
        setSparePartFilter(dataSorted);
      } catch (error) {
        console.error('Error al cargar datos: ', error);
      } finally {
        setLoading(false);
      }
    };
    if(userData?.locId || isAdmin) fetchData();
  }, [userData]);
  function buildSparePartFilter(filteredOrders, sparesAtLocation) {
    const spareCount = {};

    for (const order of filteredOrders) {
      for (const detail of order.detailOrders || []) {
        spareCount[detail.idSpare] = (spareCount[detail.idSpare] || 0) + detail.quantity;
      }
    }

    const result = Object.entries(spareCount).map(([idSpare, qtyRequested]) => {
      const found = sparesAtLocation.find(sp => sp.idSpare === idSpare);
      return {
        numSpare: found?.numberPart || 'Desconocido',
        qtyRequested
      };
    });

    return result.sort((a, b) => b.qtyRequested - a.qtyRequested).slice(0, 5);
  }
  //ORDERS LOGIC
  //Avg. Time Orders
  useEffect(() => {
    const fetchData = async () => {
      try {
        const allOrders = await getOrders();
        let filteredOrders = [];

        if (isAdmin) {
          filteredOrders = allOrders;
        } else {
          const userLocId = userData?.locId;
          filteredOrders = allOrders.filter(o => o.idLoc === userLocId);
        }

        const deliveredOrders = filteredOrders
          .filter(o => o.statusOrd === 'Entregado')
          .sort((a, b) => new Date(a.dateOrd) - new Date(b.dateOrd));

        if (deliveredOrders.length < 2) {
          console.log("No hay suficientes órdenes entregadas para calcular promedio.");
          return;
        }

        let totalDiffMs = 0;

        for (let i = 1; i < deliveredOrders.length; i++) {
          const prevDate = new Date(deliveredOrders[i - 1].dateOrd);
          const currDate = new Date(deliveredOrders[i].dateOrd);
          const diffMs = currDate - prevDate;
          totalDiffMs += diffMs;
        }

        const avgDiffMs = totalDiffMs / (deliveredOrders.length - 1);

        const avgDiffDays = avgDiffMs / (1000 * 60 * 60 * 24);
        const avgDiffHours = avgDiffMs / (1000 * 60 * 60);

        setAvgTimeOrder(`~${avgDiffDays.toFixed(2)} días (${avgDiffHours.toFixed(1)} horas)`);

      } catch (error) {
        console.error('Error al calcular promedio de órdenes:', error);
      } finally {
        setLoading(false);
      }
    };
    if(userData?.locId || isAdmin) fetchData();
  }, [userData])
  //Recently Orders
  useEffect(() => {
    const fetchData = async () => {
      try {
        const allOrders = await getOrders();
        let filteredOrders = [];
        let sortedFilteredOrders = [];
        if (isAdmin) {
          filteredOrders = allOrders;
          sortedFilteredOrders = filteredOrders.sort((a,b) => {
            const dateStrA = a?.dateOrd;
            const dateStrB = b?.dateOrd;
            
            if (!dateStrA || !dateStrB) return 0;
            
            try {
              const formattedDateA = dateStrA.replace(' a. m.', ' AM').replace(' p. m.', ' PM');
              const formattedDateB = dateStrB.replace(' a. m.', ' AM').replace(' p. m.', ' PM');
              
              const dateA = new Date(formattedDateA);
              const dateB = new Date(formattedDateB);
              
              return dateB-dateA;
            } catch (e) {
              console.error('Error al parsear fecha:', e);
              return 0;
            }
          }).slice(0,5);
          setOrders(sortedFilteredOrders);
        } else {
          const userLocId = userData?.locId;
          filteredOrders = allOrders.filter(o => o.idLoc === userLocId);

          sortedFilteredOrders = filteredOrders.sort((a,b) => {
            const dateStrA = a?.dateOrd;
            const dateStrB = b?.dateOrd;
            
            if (!dateStrA || !dateStrB) return 0;
            
            try {
              const formattedDateA = dateStrA.replace(' a. m.', ' AM').replace(' p. m.', ' PM');
              const formattedDateB = dateStrB.replace(' a. m.', ' AM').replace(' p. m.', ' PM');
              
              const dateA = new Date(formattedDateA);
              const dateB = new Date(formattedDateB);
              
              return dateB-dateA;
            } catch (e) {
              console.error('Error al parsear fecha:', e);
              return 0;
            }
          }).slice(0,5);

          setOrders(sortedFilteredOrders);
        }

      } catch (error) {
        console.error('Error al cargar datos: ', error);
      } finally {
        setLoading(false);
      }
    };
    if(userData?.locId || isAdmin) fetchData();
  }, [userData]);
  //Total Orders and List of Orders
  useEffect(() => {
    const fetchData = async () => {
      try {
        const allOrders = await getOrders();
        let filteredOrders = [];
        if (isAdmin) {
          filteredOrders = allOrders;
        } else {
          const userLocId = userData?.locId;
          filteredOrders = allOrders.filter(o => o.idLoc === userLocId);
        }

        setTotalOrders(filteredOrders.length);
        setOrdersDataChart(filteredOrders);
      } catch (error) {
        console.error("Error al cargar los datos: ", error);
      } finally {
        setLoading(false);
      }
    };
    if(userData?.locId || isAdmin) fetchData();
  }, [userData]);
  //TRANSFER LOGIC
  //Avg. Time Transfers
  useEffect(() => {
    const fetchData = async () => {
      try {
      const allTransfers = await getTransfers();
      let filteredTransfer = [];

      if (isAdmin) {
        filteredTransfer = allTransfers;
      } else {
        const userLocId = userData?.locId;
        filteredTransfer = allTransfers.filter(
          t => t.originLocation.idLoc === userLocId
        );
      }

      // Filtrar solo las transferencias completadas
      const completedTransfers = filteredTransfer.filter(
        t => t.statusTransf === "Completada"
      );

      const timeDiffs = completedTransfers.map(t => {
        const start = new Date(t.dateTransf);
        const end = new Date(t.arrivalDate);
        return end.getTime() - start.getTime();
      });

      // Promediar el tiempo
      const avgTimeMs =
        timeDiffs.reduce((sum, val) => sum + val, 0) / timeDiffs.length;

      const avgMinutes = Math.floor(avgTimeMs / 60000);
      const avgSeconds = Math.floor((avgTimeMs % 60000) / 1000);

      setAvgTimeTransfer(`${avgMinutes} min ${avgSeconds} seg`);

    } catch (error) {
      console.error("Error al cargar los datos: ", error);
    } finally {
      setLoading(false);
    }
    };
    if(userData?.locId || isAdmin) fetchData();
  }, [userData])
  //Recently Transfers
  useEffect(() => {
    const fetchData = async () => {
      try{
        const [allTransfers, regionData, locationData] = await Promise.all([
          getTransfers(),
          getAllLocations(),
          getAllLocations()
        ]);

        let sortedFilteredTransfer = [];
        let filteredTransf = [];
        //FALTA LOGICA PARA ADMIN
        if (isAdmin) {
          filteredTransf = allTransfers;

          sortedFilteredTransfer = filteredTransf.sort((a,b) => {
            const dateStrA = a?.dateTransf;
            const dateStrB = b?.dateTransf;
            
            if (!dateStrA || !dateStrB) return 0;
            
            try {
              const formattedDateA = dateStrA.replace(' a. m.', ' AM').replace(' p. m.', ' PM');
              const formattedDateB = dateStrB.replace(' a. m.', ' AM').replace(' p. m.', ' PM');
              
              const dateA = new Date(formattedDateA);
              const dateB = new Date(formattedDateB);
              
              return dateB-dateA;
            } catch (e) {
              console.error('Error al parsear fecha:', e);
              return 0;
            }
          }).slice(0,5);

          setTransfers(sortedFilteredTransfer);
          setLocations(locationData);
          setRegions(regionData);
        } else {
          //LOGICA PARA ALMACENERO
          const userLocId = userData?.locId;
          filteredTransf = allTransfers.filter(t => t.originLocation.idLoc === userLocId);
          
          
          sortedFilteredTransfer = filteredTransf.sort((a,b) => {
            const dateStrA = a?.dateTransf;
            const dateStrB = b?.dateTransf;
            
            if (!dateStrA || !dateStrB) return 0;
            
            try {
              const formattedDateA = dateStrA.replace(' a. m.', ' AM').replace(' p. m.', ' PM');
              const formattedDateB = dateStrB.replace(' a. m.', ' AM').replace(' p. m.', ' PM');
              
              const dateA = new Date(formattedDateA);
              const dateB = new Date(formattedDateB);
              
              return dateB-dateA;
            } catch (e) {
              console.error('Error al parsear fecha:', e);
              return 0;
            }
          }).slice(0,5);

          setTransfers(sortedFilteredTransfer);
          setLocations(locationData);

        }
      } catch (error) {
        console.error('Error al cargar datos: ', error);
      } finally {
        setLoading(false);
      }
    };
    if(userData?.locId || isAdmin) fetchData();
  }, [userData]);
  //Total Transfers and List of transfers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const allTransfers = await getTransfers();
        let filteredTransfer = [];

        if (isAdmin) {
          filteredTransfer = allTransfers;
        } else {
          const userLocId = userData?.locId;
          filteredTransfer = allTransfers.filter(
            t => t.originLocation.idLoc === userLocId
          );
        }
        setTotalTransfers(filteredTransfer.length);
        setTransfersDataChart(filteredTransfer);

      } catch (error) {
        console.error('Error al cargar datos: ', error);
      } finally {
        setLoading(false);
      }
    }
    if(userData?.locId || isAdmin) fetchData();
  }, [userData]);

  //LINE CHART LOGIC
  useEffect(() => {
    const data = buildChartData(ordersDataChart, transfersDataChart, selectedMonth);
    setData(data);
  }, [orders, transfers, selectedMonth]);

  function buildChartData(orders, transfers, selectedMonthIndex) {
    const today = new Date();
    const year = today.getFullYear();
    const month = selectedMonthIndex; // de 0 a 11

    const startDate = startOfMonth(new Date(year, month));
    const endDate = endOfMonth(startDate);

    const daysMap = {};

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const key = format(new Date(d), 'dd MMM', { locale: es });
      daysMap[key] = { name: key, Ordenes: 0, Transferencias: 0 };
    }

    orders.forEach(o => {
      const date = new Date(o.dateOrd);
      if (date.getMonth() === month && date.getFullYear() === year) {
        const key = format(date, 'dd MMM', { locale: es });
        if (daysMap[key]) daysMap[key].Ordenes += 1;
      }
    });

    transfers.forEach(t => {
      const date = new Date(t.dateTransf);
      if (date.getMonth() === month && date.getFullYear() === year) {
        const key = format(date, 'dd MMM', { locale: es });
        if (daysMap[key]) daysMap[key].Transferencias += 1;
      }
    });

    return Object.values(daysMap);
  }

  return (
    <PageBackground heightDefined={'min-h-full'}>
      <h1 className="text-xl font-bold mb-6 dark:text-white">Dashboard</h1>
      <div className="flex flex-col lg:flex-row gap-4 w-full mb-4">
        <CardInfo>
          <h2 className="text-2xl font-bold dark:text-white">Información general</h2>
          <hr className='my-2 dark:text-gray-400' />
          <div className="flex flex-row gap-2 flex-wrap lg:flex-nowrap">
            <div className="minicard-design flex flex-col gap-2">
              <span className='font-bold text-3xl'>{avgTimeTransfer}</span>
              <span className='font-semibold'>Tiempo promedio de traslado</span>
            </div>
            <div className="minicard-design flex flex-col gap-2">
              <span className='font-bold text-3xl'>{avgTimeOrder}</span>
              <span className='font-semibold'>Tiempo promedio en órdenes</span>
            </div>
            <div className="minicard-design flex flex-col gap-2">
              <span className='font-bold text-4xl'>{countSpareLowStock}</span>
              <span className='font-semibold'>Repuestos en estado crítico {isAdmin && ("general")}</span>
            </div>
            <div className="minicard-design flex flex-col gap-2">
              {isAdmin ? (
                <>
                  <span className='font-bold text-4xl'>{totalStock}</span>
                  <span className='font-semibold'>Stock total general</span>
                </>
              ) : (
                <>
                  <span className='font-bold text-4xl'>{totalStock}</span>
                  <span className='font-semibold'>Stock total - {userData?.locName} ({userData?.locRegName})</span>
                </>
              )}
            </div>
          </div>
        </CardInfo>
      </div>
      <div className="flex flex-col lg:flex-row gap-4 w-full mb-4">
        <CardInfo>
          <div className="flex flex-row justify-between">
            <h2 className="text-2xl font-bold dark:text-white">Movimientos de repuestos</h2>
            <div className="flex flex-row gap-4">
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="block appearance-none w-full bg-[#6750a4] border border-[#6750a4] text-white py-1 px-4 pr-8 rounded-2xl leading-tight focus:outline-none focus:ring-1 focus:ring-[#8f79cd] focus:border-[#8f79cd]"
                >
                  {meses.map((mes, index) => (
                    <option key={index} value={index}>
                      {mes}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            
          </div>
          <hr className='my-2 dark:text-gray-400' />
          <div className="flex flex-row gap-8">
            <div className="flex flex-col justify-center gap-8 ">
              <div className="dark:text-white">
                <h3 className='font-medium text-lg'>Transferencias totales:</h3>
                <span className='font-bold text-5xl'>{totalTransfers}</span>
              </div>
              <div className="dark:text-white">
                <h3 className='font-medium text-lg 2xl:text-2xl'>Órdenes totales:</h3>
                <span className='font-bold text-5xl'>{totalOrders}</span>
              </div>
            </div>
            <div className="mx-auto">
              <LineChart
                width={700}
                height={350}
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Transferencias" stroke="#8884d8" activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Ordenes" stroke="#82ca9d" />
              </LineChart>
            </div>
          </div>
          
        </CardInfo>
        <CardInfo>
          <h2 className="text-2xl font-bold dark:text-white">Transferencias entrantes</h2>
          <hr className='my-2 dark:text-gray-400' />
          
          {loading ? (
            <div className='dark:text-white'>Loading...</div>
          ) : transferAlerts.length > 0 ? (
            <div className="overflow-x-auto rounded-lg shadow-sm border mb-2 border-gray-200 dark:border-gray-700">
              <Table
                theadText={theadIncomTransf}
                tbodyData={transferAlerts}
                renderRow={(item, i) => (
                  <tr key={i} className="hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-50 dark:text-gray-200 transition-colors">
                    <td className='px-4 py-2'>{new Date(item.dateTransf).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className='px-4 py-2'>{item.originLocation.nameSt}</td>
                    {isAdmin && (
                      <td className='px-4 py-2'>{item.destinyLocation.nameSt}</td>
                    )}
                    <td className='px-4 py-2'>
                      <span className={
                        item.statusTransf === 'Pendiente' ? 'text-white dark:bg-yellow-700 bg-yellow-600 custom-status-design' :
                        item.statusTransf === 'En tránsito' ? 'text-white dark:bg-red-700 bg-red-400 custom-status-design' :
                        'text-gray-600'
                      }>
                        {item.statusTransf}
                      </span>
                    </td>
                  </tr>
                )}
              />
            </div>
          ) : (
            <p className="text-gray-500 italic text-sm m-auto h-full">No hay transferencias entrantes.</p>
          )}

        </CardInfo>
      </div>
      <div className="flex flex-col lg:flex-row gap-4 w-full mb-4">
        <CardInfo>
          <div className="flex flex-row justify-between">
            <h2 className="text-2xl font-bold dark:text-white">Estado de inventario</h2>
            
            {isAdmin ? (
              <span className='bg-[#6750a4] px-5 content-center rounded-2xl font-semibold text-white'>Vista de administrador</span>
            ) : (
              <span className='bg-[#6750a4] px-5 content-center rounded-2xl font-semibold text-white'>Almacén: {userData?.locName}</span>  
            )}
          </div>
          <hr className='my-2 dark:text-gray-400' />
          <div className="flex flex-col lg:flex-row lg:justify-around p-4">
              <div className="flex flex-col items-center gap-4 my-auto">
                <p className='dark:text-white text-xl font-bold'>Repuestos con bajo stock (crítico)</p>
                <div className="overflow-x-auto rounded-lg shadow-sm border mb-2 border-gray-200 dark:border-gray-700">
                  {loading ? (
                    <div className='dark:text-white'>Loading...</div>
                  ) : (
                    <Table
                      theadText={theadStkCrit}
                      tbodyData={spareLowStock}
                      renderRow={(item, i) => (
                        <tr key={i} className="hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-50 dark:text-gray-200 transition-colors">
                          <td className='px-4 py-2'>{item.numberPart}</td>
                          <td className='px-4 py-2'>{item.descPart}</td>
                          <td className='px-4 py-2'>
                            {isAdmin ? 
                            (
                              item.sparePartStocks.reduce((total, stock) => total + stock.quantity, 0)
                            ) : (
                              item.sparePartStocks.find(s => s.idLoc === userData?.locId)?.quantity
                            )}
                          </td>
                          <td className='px-4 py-2'>{item.sparePartStocks.quantity <= 1 ? (
                            <span className='text-white dark:bg-red-700 bg-red-600 custom-status-design'>Crítico</span>
                          ) : (
                            <span className='text-white dark:bg-amber-700 bg-amber-600 custom-status-design'>Bajo</span>
                          )}</td>
                          {isAdmin && (
                            <td className='px-4 py-2'>{locations.find(loc => loc.idLoc === item.sparePartStocks[0]?.idLoc)?.nameSt || 'N/A'}</td>
                          )}
                        </tr>
                      )}
                    />
                  )}
                </div>
              </div>
              <div className="bg-gray-400 w-[0.5px] dark:bg-white"></div>
              <div className="flex flex-col items-center gap-4 my-auto">
                <h2 className='dark:text-white text-xl font-bold'>Repuestos más demandados</h2>
                <div className="overflow-x-auto rounded-lg shadow-sm border mb-2 border-gray-200 dark:border-gray-700">
                  {loading ? (
                    <div className='dark:text-white'>Loading...</div>
                  ) : (
                    <Table
                      theadText={theadSpareMostInDemand}
                      tbodyData={sparePartFilter}
                      renderRow={(item, i) => (
                        <tr key={i} className="hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-50 dark:text-gray-200 transition-colors">
                          <td className='px-4 py-2'>{item.numSpare}</td>
                          <td className='px-4 py-2 text-center'>{item.qtyRequested}</td>
                        </tr>
                      )}
                    />
                  )}
                </div>
              </div>
          </div>
        </CardInfo>
      </div>
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        <CardInfo>
          <div className="flex flex-row justify-between">
            <h2 className="text-2xl font-bold dark:text-white">Transferencias recientes</h2>
            <span className='bg-[#6750a4] px-5 content-center rounded-2xl font-semibold text-white'>Últimos 5</span>
          </div>
            <hr className='my-2 dark:text-gray-400' />
            <div className="overflow-x-auto rounded-lg shadow-sm border mb-2 border-gray-200 dark:border-gray-700">
              {loading ? (
                <div className='dark:text-white'>Loading...</div>
              ) : (
                <Table
                  theadText={theadTextTransfer}
                  tbodyData={transfers}
                  renderRow={(item, i) => (
                    <tr key={i} className="hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-50 dark:text-gray-200 transition-colors">
                      <td className="px-4 py-2">{item.destinyLocation?.nameSt}</td>
                      <td className="px-4 py-2">{new Date(item.dateTransf).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className='px-4 py-2'>
                        {item.arrivalDate
                          ? new Date(item.arrivalDate).toLocaleString('es-PE', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : <span className="text-sm text-gray-400 italic">Aún no llega a su destino</span>
                        }
                      </td>
                      <td className='px-4 py-2'>
                        <span className={
                          item.statusTransf === 'Completada'
                            ? 'text-white dark:bg-green-700 bg-green-600 custom-status-design'
                            : 'text-white dark:bg-yellow-700 bg-yellow-600 custom-status-design'
                        }>
                          {item.statusTransf}
                        </span>
                      </td>
                    </tr> 
                  )}
                />
              )}
            </div>
        </CardInfo>

        <CardInfo>
          <div className="flex flex-row justify-between">
            <h2 className="text-2xl font-bold dark:text-white">Órdenes recientes</h2>
            <span className='bg-[#6750a4] px-5 content-center rounded-2xl font-semibold text-white'>Últimos 5</span>
          </div>
          <hr className='my-2 dark:text-gray-400' />
          <div className="overflow-x-auto rounded-lg shadow-sm border mb-2 border-gray-200 dark:border-gray-700">
            {loading ? (
              <div className='dark:text-white'>Loading...</div>
            ) : (
              <Table
                theadText={theadTextOrders}
                tbodyData={orders}
                renderRow={(item, i) => (
                  <tr key={i} className="hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-50 dark:text-gray-200 transition-colors">
                    <td className="px-4 py-2">{item.workOrd}</td>
                    <td className="px-4 py-2">{new Date(item.dateOrd).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className='px-4 py-2'>
                      <span className={
                        item.statusOrd === 'Pendiente' ? 'text-white dark:bg-yellow-700 bg-yellow-600 custom-status-design' :
                        item.statusOrd === 'Entregado' ? 'text-white dark:bg-green-700 bg-green-600 custom-status-design' :
                        'text-gray-600'
                      }>
                        {item.statusOrd}
                      </span>
                    </td>
                  </tr> 
                )}
              />
            )}
            
          </div>
        </CardInfo>
      </div>
      
    </PageBackground>
    
  )
}
