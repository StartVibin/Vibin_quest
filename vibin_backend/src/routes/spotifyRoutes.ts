import { Router } from 'express'
import { updateSpotifyData, getSpotifyData, getClaimStatus, claimSpotifyPoints, getIndexOfEmail ,getPoints, getUserByEmail} from '@/controllers/spotifyController'

const router = Router()


router.post('/update', updateSpotifyData);
router.post('/claim-status', getClaimStatus);
router.post('/claim', claimSpotifyPoints);
router.post('/points', getPoints);
router.get('/get-index-of-email', getIndexOfEmail);
router.get('/user/:email', getUserByEmail);
router.get('/:walletAddress', getSpotifyData)

export default router 