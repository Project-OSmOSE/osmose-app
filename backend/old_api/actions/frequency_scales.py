"""frequency scale import"""
from typing import Optional

from backend.api.models import LinearScale, MultiLinearScale


def get_frequency_scales(
    name: str, sample_rate: int
) -> (Optional[LinearScale], Optional[MultiLinearScale]):
    """return scale type, min freq, max freq and parameters for multiscale"""
    if name.lower() == "porp_delph":
        scale, _ = MultiLinearScale.objects.get_or_create(
            name="porp_delph",
        )
        scale.inner_scales.get_or_create(ratio=0.5, min_value=0, max_value=30_000)
        scale.inner_scales.get_or_create(ratio=0.7, min_value=30_000, max_value=80_000)
        scale.inner_scales.get_or_create(
            ratio=1, min_value=80_000, max_value=sample_rate / 2
        )
        scale.save()
        return None, scale
    if name.lower() == "dual_lf_hf":
        scale, _ = MultiLinearScale.objects.get_or_create(
            name="dual_lf_hf",
        )
        scale.inner_scales.get_or_create(ratio=0.5, min_value=0, max_value=22_000)
        scale.inner_scales.get_or_create(
            ratio=1, min_value=100_000, max_value=sample_rate / 2
        )
        scale.save()
        return None, scale
    if name.lower() == "audible":
        scale, _ = LinearScale.objects.get_or_create(
            name="audible", min_value=0, max_value=22_000
        )
        return scale, None
    return None, None
