<script lang="ts">
  let {value, hoverMessage, class: className} = $props<{value: number | null, class?: string, hoverMessage?: string}>();

  function getClass(value: number | null) {
    if (value == null) return "";
    if (value == 0) return "bg-gray-300";
    if (value < 0.2) return "bg-orange-300";
    if (value < 0.4) return "bg-orange-400";
    if (value < 0.6) return "bg-orange-500";
    if (value < 0.8) return "bg-orange-600";
    return "bg-orange-700";
  }
</script>

<div class="w-3 h-3 {getClass(value)} rounded-sm {className}" ></div>
