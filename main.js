class Process {
	constructor(name, arrival, burst, priority) {
		this.name = name;
		this.arrival = arrival;
		this.burst = burst;
		this.priority = priority;
	}
}

class System {
	constructor() {
		this.processes = [];
	}

	addProcess(newProcess) {
		if(!newProcess || !(newProcess instanceof Process))
			throw "Process must be valid.";

		this.processes.push(newProcess);
	}

	sortByArrival() {
		return this.processes.sort(function(a, b) {
			var x = a[arrival]; var y = b[arrival];
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		});
	}

	calculateFCFS() {
		var waiting_times = [];
		var current_time = 0;
		var cumulative = 0;

		for(var i = 0; i < this.processes.length; i++) {
			cumulative += current_time;
			waiting_times.push({process: this.processes[i], waiting_time: current_time});
			current_time += this.processes[i].burst;
		}

		return {waiting_times: waiting_times, average_wt: cumulative/this.processes.length, time: current_time};
	}

	calculateSJF() {
		var waiting_times = [];
		var current_time = 0;
		var cumulative = 0;

		for(var i = 0; i < this.processes.length; i++) {
			waiting_times.push({process: this.processes[i], waiting_time: 0});
		}

		waiting_times.sort(function(a, b) {
			var x = a['process'].burst; var y = b['process'].burst;
			var c = a['process'].arrival; var d = b['process'].arrival;
			return ((x < y) ? -1 : ((x > y) ? 1 : ((c < d) ? -1 : ((c > d) ? 1 : 0))));
		});

		for(var i = 0; i < waiting_times.length; i++) {
			cumulative += current_time;
			waiting_times[i].waiting_time = current_time;
			current_time += waiting_times[i].process.burst;
		}

		return {waiting_times: waiting_times, average_wt: cumulative/this.processes.length, time: current_time};
	}

	calculatePriority() {
		var waiting_times = [];
		var current_time = 0;
		var cumulative = 0;

		for(var i = 0; i < this.processes.length; i++) {
			waiting_times.push({process: this.processes[i], waiting_time: 0});
		}

		waiting_times.sort(function(a, b) {
			var x = a['process'].priority; var y = b['process'].priority;
			var c = a['process'].arrival; var d = b['process'].arrival;
			return ((x < y) ? -1 : ((x > y) ? 1 : ((c < d) ? -1 : ((c > d) ? 1 : 0))));
		});

		for(var i = 0; i < waiting_times.length; i++) {
			cumulative += current_time;
			waiting_times[i].waiting_time = current_time;
			current_time += waiting_times[i].process.burst;
		}

		return {waiting_times: waiting_times, average_wt: cumulative/this.processes.length, time: current_time};
	}

	calculateRoundRobin(timeslice) {
		// var waiting_times = [];
		var job_order = [];
		var process_w_time = [];
		var current_time = 0;
		var cumulative = 0;

		for(var i = 0; i < this.processes.length; i++) {
			// waiting_times.push({process: this.processes[i], waiting_time: 0});
			process_w_time.push({process: this.processes[i], remain: this.processes[i].burst});
		}

		var ctr = 0;
		while(process_w_time.length > 0) {
			ctr %= process_w_time.length;
			if(process_w_time[ctr].remain > 0) {
				if(timeslice >= process_w_time[ctr].remain) {
					job_order.push({process: process_w_time[ctr].process, time_occured: current_time, remain: 0});
					current_time += process_w_time[ctr].remain;
					process_w_time[ctr].remain = 0;
					process_w_time.splice(ctr, 1);
					ctr--;
				} else {
					process_w_time[ctr].remain -= timeslice;
					job_order.push({process: process_w_time[ctr].process, time_occured: current_time, remain: process_w_time[ctr].remain});
					current_time += timeslice;
				}
			}
			++ctr;
		}

		return {job_order: job_order, time: current_time};
	}

	calculateSRPT() {
		// var waiting_times = [];
		var job_order = [];
		var ordered_list_arrival = [];
		var queue = [];
		var current_time = 0;
		var currentProcess = null;
		var cumulative = 0;

		for(var i = 0; i < this.processes.length; i++) {
			// waiting_times.push({process: this.processes[i], waiting_time: 0});
			ordered_list_arrival.push({process: this.processes[i], remaining: this.processes[i].burst});
		}

		ordered_list_arrival.sort(function(a, b) {
			var x = a.process.arrival; var y = b.process.arrival;
			var c = a.process.burst; var d = b.process.burst;
			return ((x < y) ? -1 : ((x > y) ? 1 : ((c < d) ? -1 : ((c > d) ? 1 : 0))));
		});

		do {
			// console.log(ordered_list_arrival);
			
			while(ordered_list_arrival.length > 0 && ordered_list_arrival[0].process.arrival == current_time) {
				binaryInsert(ordered_list_arrival.shift(), queue);
			}

			if(currentProcess == null && queue.length > 0)
				currentProcess = queue.shift();

			if(queue.length > 0 && queue[0].remaining < currentProcess.remaining) {
				var temp = currentProcess;
				currentProcess = queue.shift();
				binaryInsert(temp, queue);
			}
			job_order.push({process: currentProcess.process, time_occured: current_time});
			currentProcess.remaining--;
			current_time++;
			if(currentProcess && currentProcess.remaining <= 0)
				currentProcess = null;

		} while (currentProcess != null || queue.length != 0 || ordered_list_arrival.length != 0);

		for(var i=0; i<job_order.length; i++)
			console.log(job_order[i].process.name + " ");

		return {job_order: job_order, time: current_time};
	}
}

function binaryInsert(item, array, startVal, endVal){
	var length = array.length;
	var start = typeof(startVal) != 'undefined' ? startVal : 0;
	var end = typeof(endVal) != 'undefined' ? endVal : length - 1;
	var m = start + Math.floor((end - start)/2);
	
	if(length == 0){
		array.push(item);
		return;
	}

	if(item.remaining > array[end].remaining) {
		array.splice(end + 1, 0, item);
		return;
	}

	if(item.remaining < array[start].remaining) {
		array.splice(start, 0, item);
		return;
	}

	if(item.remaining == array[end].remaining) {
		if(item.process.arrival > array[end].process.arrival) {
			array.splice(end + 1, 0, item);
			return;
		}
	}

	if(item.remaining == array[start].remaining) {
		if(item.process.arrival <= array[start].process.arrival) {
			array.splice(start, 0, item);
			return;
		}
	}

	if(start >= end){
		return;
	}

	if(item.remaining < array[m].remaining) {
		binaryInsert(item, array, start, m - 1);
		return;
	}

	if(item.remaining > array[m].remaining) {
		binaryInsert(item, array, m + 1, end);
		return;
	}

	if(item.remaining == array[m].remaining) {
		if(item.process.arrival <= array[m].process.arrival) {
			binaryInsert(item, array, start, m - 1);
			return;
		}

		if(item.process.arrival > array[m].process.arrival) {
			binaryInsert(item, array, m + 1, end);
			return;
		}
	}
	//we don't insert duplicates // PAKYU
}