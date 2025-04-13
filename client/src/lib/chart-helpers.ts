import { Chart, ChartData, ChartOptions } from "chart.js";
import { InventoryMovement } from "@shared/schema";
import { format, parseISO, subDays } from "date-fns";
import { es } from "date-fns/locale";

// Colors for charts
const CHART_COLORS = {
  blue: 'rgb(51, 102, 255)',
  green: 'rgb(40, 167, 69)',
  orange: 'rgb(255, 193, 7)',
  red: 'rgb(220, 53, 69)',
  purple: 'rgb(111, 66, 193)',
  cyan: 'rgb(23, 162, 184)',
  gray: 'rgb(108, 117, 125)',
};

const CHART_COLORS_TRANSPARENT = {
  blue: 'rgba(51, 102, 255, 0.2)',
  green: 'rgba(40, 167, 69, 0.2)',
  orange: 'rgba(255, 193, 7, 0.2)',
  red: 'rgba(220, 53, 69, 0.2)',
  purple: 'rgba(111, 66, 193, 0.2)',
  cyan: 'rgba(23, 162, 184, 0.2)',
  gray: 'rgba(108, 117, 125, 0.2)',
};

// Create Order Status Chart (Pie Chart)
export const createOrderStatusChart = (
  canvasElement: HTMLCanvasElement,
  data?: Record<string, number>
) => {
  // Clear any existing chart
  const existingChart = Chart.getChart(canvasElement);
  if (existingChart) {
    existingChart.destroy();
  }

  // Mock data (in a real application, this would come from the API)
  const chartData: ChartData = {
    labels: ['Pendiente', 'Confirmada', 'Parcial', 'Completada', 'Cancelada'],
    datasets: [
      {
        data: data ? Object.values(data) : [5, 8, 3, 12, 2],
        backgroundColor: [
          CHART_COLORS.orange,
          CHART_COLORS.blue,
          CHART_COLORS.cyan,
          CHART_COLORS.green,
          CHART_COLORS.red,
        ],
        borderWidth: 0,
      },
    ],
  };

  // Chart options
  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  // Create chart
  new Chart(canvasElement, {
    type: 'pie',
    data: chartData,
    options: options,
  });
};

// Create Cost by Category Chart (Bar Chart)
export const createCostCategoryChart = (
  canvasElement: HTMLCanvasElement,
  data?: Record<string, number>
) => {
  // Clear any existing chart
  const existingChart = Chart.getChart(canvasElement);
  if (existingChart) {
    existingChart.destroy();
  }

  // Mock data (in a real application, this would come from the API)
  const chartData: ChartData = {
    labels: ['Materia Prima', 'Herramientas', 'Equipo', 'Suministros', 'Servicios'],
    datasets: [
      {
        label: 'Costos por Categoría',
        data: data ? Object.values(data) : [12500, 8700, 5600, 3200, 4800],
        backgroundColor: [
          CHART_COLORS_TRANSPARENT.blue,
          CHART_COLORS_TRANSPARENT.green,
          CHART_COLORS_TRANSPARENT.orange,
          CHART_COLORS_TRANSPARENT.purple,
          CHART_COLORS_TRANSPARENT.cyan,
        ],
        borderColor: [
          CHART_COLORS.blue,
          CHART_COLORS.green,
          CHART_COLORS.orange,
          CHART_COLORS.purple,
          CHART_COLORS.cyan,
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: $${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    }
  };

  // Create chart
  new Chart(canvasElement, {
    type: 'bar',
    data: chartData,
    options: options,
  });
};

// Create Inventory Movement Chart (Line Chart)
export const createInventoryMovementChart = (
  canvasElement: HTMLCanvasElement,
  movements: InventoryMovement[] = []
) => {
  // Clear any existing chart
  const existingChart = Chart.getChart(canvasElement);
  if (existingChart) {
    existingChart.destroy();
  }

  // Prepare data for the chart
  const now = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(now, 6 - i);
    return format(date, 'dd MMM', { locale: es });
  });

  // Process inventory movements to get daily totals
  const incomingByDay = new Array(7).fill(0);
  const outgoingByDay = new Array(7).fill(0);

  if (movements && movements.length > 0) {
    movements.forEach(movement => {
      const moveDate = new Date(movement.createdAt);
      const dayIndex = 6 - Math.floor((now.getTime() - moveDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayIndex >= 0 && dayIndex < 7) {
        if (movement.quantity > 0) {
          incomingByDay[dayIndex] += movement.quantity;
        } else {
          outgoingByDay[dayIndex] += Math.abs(movement.quantity);
        }
      }
    });
  } else {
    // Demo data if no movements provided
    incomingByDay.splice(0, incomingByDay.length, 15, 20, 8, 25, 12, 5, 18);
    outgoingByDay.splice(0, outgoingByDay.length, 8, 12, 5, 18, 10, 7, 14);
  }

  const chartData: ChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Entradas',
        data: incomingByDay,
        backgroundColor: CHART_COLORS_TRANSPARENT.green,
        borderColor: CHART_COLORS.green,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Salidas',
        data: outgoingByDay,
        backgroundColor: CHART_COLORS_TRANSPARENT.red,
        borderColor: CHART_COLORS.red,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      }
    ],
  };

  // Chart options
  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad',
        }
      }
    }
  };

  // Create chart
  new Chart(canvasElement, {
    type: 'line',
    data: chartData,
    options: options,
  });
};

// Create Inventory Value Chart (Line Chart)
export const createInventoryValueChart = (
  canvasElement: HTMLCanvasElement,
  data?: { dates: string[], values: number[] }
) => {
  // Clear any existing chart
  const existingChart = Chart.getChart(canvasElement);
  if (existingChart) {
    existingChart.destroy();
  }

  // Default data if none provided
  const dates = data?.dates || 
    Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 11 + i);
      return format(date, 'MMM yyyy', { locale: es });
    });

  const values = data?.values || 
    [125000, 128000, 135000, 132000, 140000, 145000, 150000, 148000, 155000, 160000, 158000, 165000];

  const chartData: ChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Valor del Inventario',
        data: values,
        backgroundColor: CHART_COLORS_TRANSPARENT.blue,
        borderColor: CHART_COLORS.blue,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      }
    ],
  };

  // Chart options
  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw || 0;
            return `Valor: $${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    }
  };

  // Create chart
  new Chart(canvasElement, {
    type: 'line',
    data: chartData,
    options: options,
  });
};

// Create Top Suppliers Chart (Horizontal Bar Chart)
export const createTopSuppliersChart = (
  canvasElement: HTMLCanvasElement,
  data?: { suppliers: string[], values: number[] }
) => {
  // Clear any existing chart
  const existingChart = Chart.getChart(canvasElement);
  if (existingChart) {
    existingChart.destroy();
  }

  // Default data if none provided
  const suppliers = data?.suppliers || 
    ['Aceros Industriales', 'Electrónicos SA', 'Químicos Unidos', 'Suministros Técnicos', 'Herramientas Pro'];

  const values = data?.values || 
    [45000, 38000, 32000, 25000, 18000];

  const chartData: ChartData = {
    labels: suppliers,
    datasets: [
      {
        axis: 'y',
        label: 'Compras',
        data: values,
        backgroundColor: [
          CHART_COLORS_TRANSPARENT.blue,
          CHART_COLORS_TRANSPARENT.green,
          CHART_COLORS_TRANSPARENT.orange,
          CHART_COLORS_TRANSPARENT.purple,
          CHART_COLORS_TRANSPARENT.cyan,
        ],
        borderColor: [
          CHART_COLORS.blue,
          CHART_COLORS.green,
          CHART_COLORS.orange,
          CHART_COLORS.purple,
          CHART_COLORS.cyan,
        ],
        borderWidth: 1,
      }
    ],
  };

  // Chart options
  const options: ChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw || 0;
            return `Compras: $${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    }
  };

  // Create chart
  new Chart(canvasElement, {
    type: 'bar',
    data: chartData,
    options: options,
  });
};

// Create Monthly Purchases Chart (Bar and Line Combined)
export const createMonthlyPurchasesChart = (
  canvasElement: HTMLCanvasElement,
  data?: { months: string[], values: number[], counts: number[] }
) => {
  // Clear any existing chart
  const existingChart = Chart.getChart(canvasElement);
  if (existingChart) {
    existingChart.destroy();
  }

  // Default data if none provided
  const months = data?.months || 
    Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 5 + i);
      return format(date, 'MMM yyyy', { locale: es });
    });

  const values = data?.values || 
    [38000, 42000, 35000, 50000, 45000, 55000];

  const counts = data?.counts || 
    [12, 15, 10, 18, 16, 20];

  const chartData: ChartData = {
    labels: months,
    datasets: [
      {
        type: 'bar',
        label: 'Monto ($)',
        data: values,
        backgroundColor: CHART_COLORS_TRANSPARENT.blue,
        borderColor: CHART_COLORS.blue,
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line',
        label: 'Cantidad',
        data: counts,
        borderColor: CHART_COLORS.orange,
        backgroundColor: CHART_COLORS.orange,
        borderWidth: 2,
        yAxisID: 'y1',
        tension: 0.4,
      }
    ],
  };

  // Chart options
  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const datasetLabel = context.dataset.label || '';
            const value = context.raw || 0;
            if (datasetLabel === 'Monto ($)') {
              return `${datasetLabel}: $${value}`;
            }
            return `${datasetLabel}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Monto ($)',
        },
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad',
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  };

  // Create chart
  new Chart(canvasElement, {
    type: 'bar',
    data: chartData,
    options: options,
  });
};
