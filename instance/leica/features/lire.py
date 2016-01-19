
from leica.features.base import NDImageFeature

from pylire.process.edge_histogram import edge_histogram
from pylire.process.edge_histogram import edge_histo_base64, edge_histo_bytes
from pylire.process.edge_histogram import edge_histo_str, edge_histo_bithash_str

from pylire.process.opponent_histogram import opponent_histogram
from pylire.process.opponent_histogram import oh_str, oh_bithash_str, oh_base64

class OpponentHistogram(NDImageFeature):
    def extractor(self, R, G, B):
        return oh_str(
            opponent_histogram(R, G, B))

class OpponentHistogramBitHash(NDImageFeature):
    def extractor(self, R, G, B):
        return oh_bithash_str(
            opponent_histogram(R, G, B))

class OpponentHistogramBase64(NDImageFeature):
    def extractor(self, R, G, B):
        return oh_base64(
            opponent_histogram(R, G, B))

class EdgeHistogram(NDImageFeature):
    def extractor(self, R, G, B):
        return edge_histo_str(
            edge_histogram(R, G, B))

class EdgeHistogramBitHash(NDImageFeature):
    def extractor(self, R, G, B):
        return edge_histo_bithash_str(
            edge_histogram(R, G, B))

class EdgeHistogramBase64(NDImageFeature):
    def extractor(self, R, G, B):
        return edge_histo_base64(edge_histo_bytes(
            edge_histogram(R, G, B)))

