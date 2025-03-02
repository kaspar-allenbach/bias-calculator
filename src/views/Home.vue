<template>
  <div class="container mx-auto p-4">
    <h1 class="text-xl font-bold mb-4">Bias Calculator</h1>
    
    <table class="w-full border border-gray-300">
      <thead>
        <tr>
          <th class="border p-2">Name</th>
          <th v-for="(bias, index) in biases" :key="index" class="border p-2">Bias {{ index + 1 }}</th>
          <th class="border p-2">Weight (%)</th>
          <th class="border p-2">Priority</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in tableData" :key="rowIndex" :class="getRowClass(row)">
          <td class="border p-2">
            <input v-model="row.name" class="border p-1 w-full" type="text" />
          </td>
          <td v-for="(bias, biasIndex) in biases" :key="biasIndex" class="border p-2 text-center">
            <input v-model="row.selectedBias" type="radio" :value="biasIndex" />
          </td>
          <td class="border p-2 text-center">{{ calculateWeight(rowIndex) }}%</td>
          <td class="border p-2">
            <input v-model.number="row.priority" class="border p-1 w-full text-center" type="number" min="1" />
          </td>
        </tr>
      </tbody>
    </table>
    
    <button @click="addRow" class="mt-4 p-2 bg-blue-500 text-white rounded">Add Line</button>
    <button @click="share" class="mt-4 ml-2 p-2 bg-green-500 text-white rounded">Share</button>
  </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
  setup() {
    const biases = ref([0, 1, 2, 3]); // Bias 1 - 4
    const tableData = ref([]);
    const route = useRoute();
    const router = useRouter();

    const addRow = () => {
      tableData.value.push({
        name: '',
        selectedBias: null,
        priority: tableData.value.length + 1
      });
    };

    const calculateWeight = (index) => {
      return (100 / tableData.value.length).toFixed(2); // Simple equal weighting
    };

    const getRowClass = (row) => {
      return row.selectedBias !== null ? `bias-${row.selectedBias}` : '';
    };

    const share = () => {
      const params = encodeURIComponent(JSON.stringify(tableData.value));
      router.push({ query: { data: params } });
    };

    watch(
      () => route.query.data,
      (newData) => {
        if (newData) {
          tableData.value = JSON.parse(decodeURIComponent(newData));
        }
      },
      { immediate: true }
    );

    return { tableData, biases, addRow, calculateWeight, share, getRowClass };
  }
};
</script>

<style>
.bias-0 { background-color: #ffcccc; }
.bias-1 { background-color: #ffebcc; }
.bias-2 { background-color: #ccffcc; }
.bias-3 { background-color: #cce5ff; }
</style>
