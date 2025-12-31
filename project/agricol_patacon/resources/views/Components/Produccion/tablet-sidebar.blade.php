@include('tablet')
{{-- tablet.blade.php --}}
<script>
    window.usuario = @json(session('usuario'));
    window.modulo = @json(session('modulo'));
</script>
<div class="sidebar hidden" id="sidebar">
    <ul></ul>
</div>
<button class="flotante position-fixed m-4 border-0 btn btn-toggle rounded-pill" id="toggle-sidebar">
    <i class="ft-menu text-white fs-2"></i>
</button>
<script src="/assets/js/logout.js"></script>
<script type="module" src="{{ asset('assets/js/navigation.js') }}"></script>
<script type="module" src="{{ asset('assets/js/tablet-sidebar.js') }}"></script>
<script type="module" src="{{ asset('assets/js/tablet-sidebar-toggle.js') }}"></script>